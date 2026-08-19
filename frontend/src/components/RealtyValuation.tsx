/**
 * PTAH Realty mini-app -- CMA, PDF report generation, and listing feed/
 * distribution, in one flow. Styled to match the Ptah console (slate/amber
 * palette, font-mono status chips).
 */

import React, { useState } from "react";
import {
  Home,
  Calculator,
  FileText,
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Copy,
  Camera,
  Trash2,
} from "lucide-react";

interface ValuationResult {
  id: string;
  method: string;
  comparable_count: number;
  price_per_sqm: { low: number; mid: number; high: number };
  estimated_value: { low: number; mid: number; high: number };
  confidence_score: number;
}

interface MediaAsset {
  id: string;
  original_url: string;
  condition_notes: string | null;
}

interface PublishResult {
  success: boolean;
  error_message?: string;
  feed_xml?: string;
}

const CURRENCY = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

const inputCls =
  "w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

export default function RealtyValuation() {
  // Step 0: comparable ingestion (Property24 scrape via Apify)
  const [searchLocation, setSearchLocation] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestCount, setIngestCount] = useState<number | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingestStatusLabel, setIngestStatusLabel] = useState<string | null>(null);

  // Step 1: property form
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    addressLine: "",
    suburb: "",
    city: "",
    propertyType: "apartment",
    complexName: "",
    bedrooms: 2,
    bathrooms: 2,
    floorSizeSqm: 75,
    erfSizeSqm: 0,
    lat: -33.9249,
    lng: 18.4241,
    askingPrice: 0,
  });
  const [isSavingProperty, setIsSavingProperty] = useState(false);

  // Step 1b: property photos (feed the PDF report and the listing feed)
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [conditionNotesInput, setConditionNotesInput] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Step 2: valuation
  const [method, setMethod] = useState<"radius" | "complex" | "suburb">("radius");
  const [radiusM, setRadiusM] = useState(1500);
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [isValuating, setIsValuating] = useState(false);
  const [valuationError, setValuationError] = useState<string | null>(null);

  // Step 3: report
  const [reportStatus, setReportStatus] = useState<"idle" | "rendering" | "ready" | "failed">("idle");
  const [reportError, setReportError] = useState<string | null>(null);

  // Step 4: listing feed / distribution
  const [listingDescription, setListingDescription] = useState("");
  const [listingPrice, setListingPrice] = useState(0);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleIngest = async () => {
    if (!searchLocation) return;
    setIsIngesting(true);
    setIngestError(null);
    setIngestCount(null);
    setIngestStatusLabel("Starting...");
    try {
      // /comparables/ingest kicks off a background job and returns
      // immediately (see backend api/routes.py for why -- Property24 can
      // currently take 90s+ per actor call, which was exceeding the
      // Vercel/Cloudflare/ALB proxy timeouts and surfacing as a 502 even
      // though the backend request eventually succeeded). We poll the
      // job status instead of waiting on one long request.
      const res = await fetch("/api/v1/realty/comparables/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_location: searchLocation, property_type: form.propertyType }),
      });
      const data = await res.json();
      if (!res.ok || !data.job_id) {
        setIngestError(data.detail || "Ingestion failed to start.");
        setIsIngesting(false);
        return;
      }

      const jobId = data.job_id;
      const POLL_INTERVAL_MS = 3000;
      const MAX_POLLS = 60; // ~3 minutes
      for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const statusRes = await fetch(`/api/v1/realty/comparables/ingest/${jobId}`);
        const statusData = await statusRes.json();
        const job = statusData.job;
        if (!statusRes.ok || !job) {
          setIngestError(statusData.detail || "Lost track of the ingestion job.");
          break;
        }
        if (job.status === "succeeded") {
          setIngestCount(job.upserted_count);
          setIngestStatusLabel(null);
          break;
        }
        if (job.status === "failed") {
          setIngestError(job.error || "Ingestion failed.");
          setIngestStatusLabel(null);
          break;
        }
        setIngestStatusLabel(
          job.status === "running" ? "Searching Property24 (this can take a minute or two)..." : "Queued..."
        );
      }
    } catch (e: any) {
      setIngestError(e.message || "Could not reach the ingestion service.");
    } finally {
      setIsIngesting(false);
      setIngestStatusLabel(null);
    }
  };

  const handleSaveProperty = async () => {
    setIsSavingProperty(true);
    try {
      const res = await fetch("/api/v1/realty/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address_line: form.addressLine,
          suburb: form.suburb,
          city: form.city,
          property_type: form.propertyType,
          complex_name: form.complexName || null,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          floor_size_sqm: form.floorSizeSqm,
          erf_size_sqm: form.erfSizeSqm || null,
          lat: form.lat,
          lng: form.lng,
          asking_price: form.askingPrice || null,
        }),
      });
      const data = await res.json();
      if (res.ok) setPropertyId(data.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingProperty(false);
    }
  };

  const handleUploadMedia = async (file: File) => {
    if (!propertyId) return;
    setIsUploadingMedia(true);
    setMediaError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      if (conditionNotesInput) body.append("condition_notes", conditionNotesInput);
      body.append("sort_order", String(mediaList.length));

      const res = await fetch(`/api/v1/realty/properties/${propertyId}/media`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (res.ok) {
        setMediaList((prev) => [...prev, data]);
        setConditionNotesInput("");
      } else {
        setMediaError(data.detail || "Photo upload failed.");
      }
    } catch (e: any) {
      setMediaError(e.message || "Could not reach the media service.");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await fetch(`/api/v1/realty/media/${mediaId}`, { method: "DELETE" });
      setMediaList((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunValuation = async () => {
    if (!propertyId) return;
    setIsValuating(true);
    setValuationError(null);
    setValuation(null);
    try {
      const res = await fetch("/api/v1/realty/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: propertyId, method, radius_m: radiusM }),
      });
      const data = await res.json();
      if (res.ok) setValuation(data);
      else setValuationError(data.detail || "Valuation failed.");
    } catch (e: any) {
      setValuationError(e.message || "Could not reach the valuation service.");
    } finally {
      setIsValuating(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!propertyId || !valuation) return;
    setReportStatus("rendering");
    setReportError(null);
    try {
      const res = await fetch("/api/v1/realty/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: propertyId, valuation_snapshot_id: valuation.id }),
      });
      const data = await res.json();
      if (res.ok) setReportStatus("ready");
      else {
        setReportStatus("failed");
        setReportError(data.detail || "Report generation failed.");
      }
    } catch (e: any) {
      setReportStatus("failed");
      setReportError(e.message || "Could not reach the report service.");
    }
  };

  const handlePublish = async () => {
    if (!propertyId || !listingDescription || !listingPrice) return;
    setIsPublishing(true);
    setPublishResult(null);
    try {
      const res = await fetch("/api/v1/realty/listings/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          description: listingDescription,
          price: listingPrice,
        }),
      });
      const data = await res.json();
      setPublishResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPublishing(false);
    }
  };

  const copyFeedXml = () => {
    if (publishResult?.feed_xml) navigator.clipboard.writeText(publishResult.feed_xml);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-900 pb-4">
        <h2 className="font-sans font-bold text-2xl text-white flex items-center gap-2 uppercase">
          <Home className="w-5 h-5 text-amber-500" />
          Realty Valuation &amp; Publishing
        </h2>
        <p className="text-xs text-slate-400">
          Comparative market analysis, automated client-facing PDF reports, and listing feed generation
          for completed development sales.
        </p>
      </div>

      {/* Step 0: comparable ingestion */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-3">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
          0. Pull Comparable Sales (Property24)
        </span>
        <div className="flex gap-3">
          <input
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="e.g. Camps Bay, Cape Town"
            className={inputCls + " flex-1"}
          />
          <button
            onClick={handleIngest}
            disabled={isIngesting || !searchLocation}
            className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-200 font-sans font-bold px-4 rounded text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            {isIngesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Pull Comparables
          </button>
        </div>
        {ingestStatusLabel && (
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> {ingestStatusLabel}
          </p>
        )}
        {ingestCount !== null && (
          <p className="text-[11px] text-emerald-400 font-mono">Upserted {ingestCount} comparable sales.</p>
        )}
        {ingestError && (
          <p className="text-[11px] text-red-400 font-mono bg-red-950/30 border border-red-900/40 rounded p-2">
            {ingestError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Step 1: Property */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            1. Property Details
          </span>

          <div className="grid grid-cols-1 gap-3">
            <Field label="ADDRESS">
              <input
                value={form.addressLine}
                onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                placeholder="12 Fig Tree Lane"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SUBURB">
                <input
                  value={form.suburb}
                  onChange={(e) => setForm({ ...form, suburb: e.target.value })}
                  placeholder="Camps Bay"
                  className={inputCls}
                />
              </Field>
              <Field label="CITY">
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Cape Town"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="COMPLEX / BUILDING (optional)">
              <input
                value={form.complexName}
                onChange={(e) => setForm({ ...form, complexName: e.target.value })}
                placeholder="The Fig Tree Estate"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="TYPE">
                <select
                  value={form.propertyType}
                  onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                  className={inputCls}
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="vacant_land">Vacant Land</option>
                </select>
              </Field>
              <Field label="BEDS">
                <input
                  type="number"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
              <Field label="BATHS">
                <input
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="FLOOR SIZE (sqm)">
                <input
                  type="number"
                  value={form.floorSizeSqm}
                  onChange={(e) => setForm({ ...form, floorSizeSqm: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
              <Field label="ASKING PRICE (R)">
                <input
                  type="number"
                  value={form.askingPrice || ""}
                  onChange={(e) => setForm({ ...form, askingPrice: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          <button
            onClick={handleSaveProperty}
            disabled={isSavingProperty || !form.addressLine || !form.suburb}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-sans font-bold py-3 rounded text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            {isSavingProperty ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : propertyId ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : null}
            {propertyId ? "Property Saved" : "Save Property"}
          </button>
          {propertyId && (
            <span className="text-[10px] font-mono text-slate-500 block truncate">ID: {propertyId}</span>
          )}

          {propertyId && (
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                1b. Property Photos (optional)
              </span>
              <Field label="CONDITION NOTES (applies to next photo)">
                <input
                  value={conditionNotesInput}
                  onChange={(e) => setConditionNotesInput(e.target.value)}
                  placeholder="Recently repainted, new carpets..."
                  className={inputCls}
                />
              </Field>
              <label className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-bold py-3 rounded text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 cursor-pointer">
                {isUploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {isUploadingMedia ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isUploadingMedia}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadMedia(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {mediaError && (
                <p className="text-[11px] text-red-400 font-mono bg-red-950/30 border border-red-900/40 rounded p-2">
                  {mediaError}
                </p>
              )}
              {mediaList.length > 0 && (
                <ul className="space-y-1.5">
                  {mediaList.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-2 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5"
                    >
                      <img src={m.original_url} alt="" className="w-8 h-8 object-cover rounded shrink-0" />
                      <span className="text-[10px] text-slate-400 truncate flex-1">
                        {m.condition_notes || "no notes"}
                      </span>
                      <button
                        onClick={() => handleDeleteMedia(m.id)}
                        className="text-slate-500 hover:text-red-400 shrink-0"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Valuation */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            2. Run Comparative Market Analysis
          </span>

          <Field label="AGGREGATION METHOD">
            <select value={method} onChange={(e) => setMethod(e.target.value as any)} className={inputCls}>
              <option value="radius">Geo Radius</option>
              <option value="complex">Same Complex / Building</option>
              <option value="suburb">Suburb</option>
            </select>
          </Field>
          {method === "radius" && (
            <Field label={`RADIUS: ${radiusM} m`}>
              <input
                type="range"
                min={250}
                max={5000}
                step={250}
                value={radiusM}
                onChange={(e) => setRadiusM(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </Field>
          )}

          <button
            onClick={handleRunValuation}
            disabled={!propertyId || isValuating}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-200 font-sans font-bold py-3 rounded text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
          >
            {isValuating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
            Compute Valuation
          </button>

          {valuationError && (
            <p className="text-[11px] text-red-400 font-mono bg-red-950/30 border border-red-900/40 rounded p-2">
              {valuationError}
            </p>
          )}

          {valuation && (
            <div className="bg-slate-950 border border-slate-800 rounded p-4 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Estimated Value</span>
              <div className="font-sans text-2xl font-extrabold text-emerald-400">
                {CURRENCY.format(valuation.estimated_value.low)} &ndash; {CURRENCY.format(valuation.estimated_value.high)}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Mid: {CURRENCY.format(valuation.estimated_value.mid)}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900">
                <span>{valuation.comparable_count} comparables</span>
                <span className="text-amber-500">
                  Confidence {Math.round(valuation.confidence_score * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 3+4: Report + Listing feed */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            3. Report &amp; Distribution
          </span>

          <button
            onClick={handleGenerateReport}
            disabled={!valuation || reportStatus === "rendering"}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-200 font-sans font-bold py-3 rounded text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
          >
            {reportStatus === "rendering" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : reportStatus === "ready" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {reportStatus === "ready" ? "PDF Report Ready" : "Generate Client PDF Report"}
          </button>
          {reportError && (
            <p className="text-[11px] text-red-400 font-mono bg-red-950/30 border border-red-900/40 rounded p-2">
              {reportError}
            </p>
          )}

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <Field label="LISTING DESCRIPTION">
              <textarea
                rows={3}
                value={listingDescription}
                onChange={(e) => setListingDescription(e.target.value)}
                placeholder="Bright, north-facing 2-bed in a secure complex..."
                className={inputCls}
              />
            </Field>
            <Field label="LISTING PRICE (R)">
              <input
                type="number"
                value={listingPrice || ""}
                onChange={(e) => setListingPrice(Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <button
              onClick={handlePublish}
              disabled={!propertyId || isPublishing || !listingDescription || !listingPrice}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-sans font-bold py-3 rounded text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish / Generate Feed
            </button>
          </div>

          {publishResult && (
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-2">
              {publishResult.success ? (
                <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Published via Entegral Sync
                </span>
              ) : (
                <>
                  <span className="text-amber-400 text-[11px] font-mono flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> No direct push configured
                  </span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{publishResult.error_message}</p>
                  {publishResult.feed_xml && (
                    <button
                      onClick={copyFeedXml}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono py-1.5 rounded flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Copy className="w-3 h-3" /> Copy Feed XML
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 border-t border-slate-900 pt-4">
        <Clock className="w-3 h-3" />
        <span>
          Flow: pull comparables &rarr; save property &rarr; (optional) add photos &rarr; compute CMA
          valuation &rarr; generate client PDF &rarr; publish / export listing feed.
        </span>
      </div>
    </div>
  );
}
