"""
PTAH Realty -- narrative generation + PDF report render.

The LLM only ever sees the already-computed valuation numbers and writes
prose around them; the PDF re-injects every number straight from the
valuation snapshot dict, so nothing in a report's figures traces back to
the model's own output.
"""

from __future__ import annotations

import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
)

from services.bedrock import generate_json

# PTAH brand palette
BRAND_AMBER = colors.HexColor("#f59e0b")
BRAND_SLATE = colors.HexColor("#334155")
BRAND_TEXT = colors.HexColor("#1e293b")


def generate_narrative(prop: dict, valuation, condition_notes: list[str]) -> dict:
    notes = "; ".join(condition_notes) if condition_notes else "none provided"
    price_basis = getattr(valuation, "price_basis", "sold")
    basis_note = {
        "sold": "All comparables are confirmed sale prices.",
        "asking": (
            "IMPORTANT: no confirmed sold-price data was available for this area, so "
            "these comparables are current ASKING prices (not confirmed sales). You "
            "must clearly caveat this in valuation_methodology -- do not present this "
            "range as based on confirmed sales."
        ),
        "mixed": (
            "IMPORTANT: this comparable set mixes confirmed sale prices with some "
            "current asking prices (no sold data was available for part of the area). "
            "You must clearly caveat this in valuation_methodology."
        ),
    }[price_basis]

    prompt = f"""You are a professional real estate copywriter. Using ONLY the structured
data below, write client-facing report copy. Do not invent any numbers, dates, or facts
beyond what is given. Return strict JSON with keys: market_context, valuation_methodology,
key_selling_points (array of 3-5 short strings).

Property: {prop['address_line']}, {prop['suburb']}, {prop['city']}
Type: {prop['property_type']}, Bedrooms: {prop.get('bedrooms', 'n/a')}, Bathrooms: {prop.get('bathrooms', 'n/a')}
Floor size: {prop.get('floor_size_sqm', 'n/a')} sqm, Erf size: {prop.get('erf_size_sqm', 'n/a')} sqm
Complex: {prop.get('complex_name', 'n/a')}

Valuation method: {valuation.method} (radius: {valuation.radius_m or 'n/a'} m)
Comparable count: {valuation.comparable_count}
Price per sqm range: R{valuation.price_per_sqm['low']} - R{valuation.price_per_sqm['high']} (mid R{valuation.price_per_sqm['mid']})
Estimated value range: R{valuation.estimated_value['low']} - R{valuation.estimated_value['high']} (mid R{valuation.estimated_value['mid']})
Confidence score: {valuation.confidence_score}
Comparable data basis: {price_basis}. {basis_note}

Condition notes: {notes}"""

    return generate_json(prompt)


def render_report_pdf(prop: dict, valuation, narrative: dict, photo_paths: list[str], output_path: str) -> str:
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        topMargin=20 * mm, bottomMargin=20 * mm, leftMargin=15 * mm, rightMargin=15 * mm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("PtahTitle", parent=styles["Title"], textColor=BRAND_TEXT, fontSize=22, spaceAfter=2)
    subtitle_style = ParagraphStyle("PtahSubtitle", parent=styles["Normal"], textColor=BRAND_SLATE, fontSize=11, spaceAfter=16)
    h2_style = ParagraphStyle("PtahH2", parent=styles["Heading2"], textColor=BRAND_AMBER, spaceBefore=16, spaceAfter=6)
    value_style = ParagraphStyle("PtahValue", parent=styles["Normal"], fontSize=26, textColor=colors.HexColor("#0f5132"), spaceAfter=4)
    body_style = styles["BodyText"]

    story = [
        Paragraph(prop["address_line"], title_style),
        Paragraph(f"{prop['suburb']}, {prop['city']}", subtitle_style),
        Paragraph(f"R{valuation.estimated_value['low']:,.0f} &ndash; R{valuation.estimated_value['high']:,.0f}", value_style),
        Paragraph(f"Mid-point estimate: R{valuation.estimated_value['mid']:,.0f}", body_style),
        Paragraph(
            f"Confidence: {round(valuation.confidence_score * 100)}% (based on {valuation.comparable_count} comparables)",
            body_style,
        ),
    ]

    price_basis = getattr(valuation, "price_basis", "sold")
    if price_basis != "sold":
        caveat_style = ParagraphStyle(
            "PtahCaveat", parent=body_style, textColor=colors.HexColor("#b45309"),
            backColor=colors.HexColor("#fffbeb"), borderColor=colors.HexColor("#f59e0b"),
            borderWidth=1, borderPadding=8, spaceAfter=12,
        )
        caveat_text = (
            "No confirmed sold-price data was available for this area at the time of "
            "this report -- the range above is based on current asking prices, not "
            "confirmed sales, and should be treated as indicative only."
            if price_basis == "asking" else
            "Some comparables in this report are current asking prices rather than "
            "confirmed sales, due to limited sold-price data for this area."
        )
        story.append(Paragraph(f"\u26a0 {caveat_text}", caveat_style))

    story += [
        Paragraph("Market Context", h2_style),
        Paragraph(narrative["market_context"], body_style),
        Paragraph("Valuation Methodology", h2_style),
        Paragraph(narrative["valuation_methodology"], body_style),
        Paragraph("Key Selling Points", h2_style),
        ListFlowable(
            [ListItem(Paragraph(p, body_style)) for p in narrative["key_selling_points"]],
            bulletType="bullet",
        ),
    ]

    if photo_paths:
        story.append(Paragraph("Property Photos", h2_style))
        row: list = []
        for path in photo_paths:
            if not os.path.exists(path):
                continue
            row.append(Image(path, width=80 * mm, height=60 * mm))
            if len(row) == 2:
                story.append(Table([row], colWidths=[85 * mm, 85 * mm]))
                story.append(Spacer(1, 6 * mm))
                row = []
        if row:
            story.append(Table([row], colWidths=[85 * mm]))

    doc.build(story)
    return output_path
