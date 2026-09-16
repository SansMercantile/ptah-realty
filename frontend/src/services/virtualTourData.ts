import { Virtual3DTour } from '../types';

export const INITIAL_3D_TOURS: Record<string, Virtual3DTour> = {
  'prop-1681': {
    id: 'tour-prop-1681',
    propertyId: 'prop-1681',
    propertyAddress: '5 Richmond Road, Three Anchor Bay',
    title: 'Immersive 3D Spatial Walkthrough | 5 Richmond Road',
    createdAt: '2026-08-27T10:15:00Z',
    totalRooms: 6,
    totalAreaM2: 201,
    dollhouseMeshGenerated: true,
    initialRoomId: 'room-living',
    aiReconstructionStatus: 'COMPLETED',
    spatialAccuracyCm: 1.2,
    reconstructionSource: 'uploaded_photos',
    floorPlan2DUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      {
        id: 'room-living',
        name: 'Open-Concept Living & Reception',
        tag: 'Living Room',
        panoramaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
        dimensionsM: { length: 7.2, width: 4.8, height: 3.1 },
        extentM2: 34.56,
        cameraPosition: { x: 0, y: 1.6, z: 0 },
        hotspots: [
          {
            id: 'hs-liv-to-kit',
            targetRoomId: 'room-kitchen',
            targetRoomName: 'Gourmet Chef Kitchen',
            pitch: -4,
            yaw: 42,
            label: 'Walk to Kitchen'
          },
          {
            id: 'hs-liv-to-terrace',
            targetRoomId: 'room-terrace',
            targetRoomName: 'Plunge Pool Courtyard',
            pitch: -2,
            yaw: 175,
            label: 'Step to Pool Courtyard'
          },
          {
            id: 'hs-liv-to-foyer',
            targetRoomId: 'room-foyer',
            targetRoomName: 'Heritage Entrance Foyer',
            pitch: 0,
            yaw: -110,
            label: 'Front Entrance Foyer'
          }
        ],
        interactivePins: [
          {
            id: 'pin-liv-fireplace',
            pitch: 2,
            yaw: -15,
            title: 'Victorian Cast-Iron Fireplace',
            description: 'Original 1898 restored hearth with decorative ceramic tile surround and flued chimney.',
            type: 'feature'
          },
          {
            id: 'pin-liv-ceiling',
            pitch: 42,
            yaw: 10,
            title: 'Ceiling Height: 3.10 Metres',
            description: 'Soaring heritage ceilings with molded cornices and dimmable architectural cove lighting.',
            type: 'dimension'
          },
          {
            id: 'pin-liv-flooring',
            pitch: -38,
            yaw: 55,
            title: 'Solid European Oak Chevron Parquet',
            description: 'Treated with matte UV-oil finish, acoustic underlay, and hydronic underfloor heating.',
            type: 'material'
          }
        ]
      },
      {
        id: 'room-kitchen',
        name: 'Gourmet Chef\'s Kitchen & Dining',
        tag: 'Gourmet Kitchen',
        panoramaUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2000&q=85',
        dimensionsM: { length: 5.4, width: 4.2, height: 3.1 },
        extentM2: 22.68,
        cameraPosition: { x: 3.2, y: 1.6, z: 2.1 },
        hotspots: [
          {
            id: 'hs-kit-to-liv',
            targetRoomId: 'room-living',
            targetRoomName: 'Living Room',
            pitch: 0,
            yaw: -138,
            label: 'Return to Living Area'
          },
          {
            id: 'hs-kit-to-terrace',
            targetRoomId: 'room-terrace',
            targetRoomName: 'Pool Courtyard',
            pitch: -3,
            yaw: 88,
            label: 'Slide Open to Pool Terrace'
          }
        ],
        interactivePins: [
          {
            id: 'pin-kit-island',
            pitch: -22,
            yaw: -5,
            title: 'Caesarstone Calacatta Nuvo Island',
            description: 'Waterfall edge 3.2m centre island with flush undermount prep sink and pop-up power modules.',
            type: 'material'
          },
          {
            id: 'pin-kit-appliances',
            pitch: 5,
            yaw: 62,
            title: 'Integrated SMEG Dolce Stil Novo Suite',
            description: '90cm induction & gas hybrid hob, dual thermo-ventilated ovens, and concealed dishwasher.',
            type: 'spec'
          }
        ]
      },
      {
        id: 'room-terrace',
        name: 'Private Plunge Pool & Dining Courtyard',
        tag: 'Garden & Pool',
        panoramaUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=2000&q=85',
        dimensionsM: { length: 6.8, width: 4.5, height: 3.5 },
        extentM2: 30.6,
        cameraPosition: { x: 0, y: 1.6, z: 6.5 },
        hotspots: [
          {
            id: 'hs-terrace-to-liv',
            targetRoomId: 'room-living',
            targetRoomName: 'Living Room',
            pitch: 2,
            yaw: 0,
            label: 'Enter Living Room'
          },
          {
            id: 'hs-terrace-to-master',
            targetRoomId: 'room-master',
            targetRoomName: 'Master Bedroom Suite',
            pitch: 4,
            yaw: 75,
            label: 'Master Bedroom Wing'
          }
        ],
        interactivePins: [
          {
            id: 'pin-pool-spec',
            pitch: -35,
            yaw: -20,
            title: 'Heated Salt-Chlorinated Plunge Pool',
            description: '4.2m x 2.4m plunge pool with mosaic tile finish, automated solar heat pump, and LED night lighting.',
            type: 'feature'
          },
          {
            id: 'pin-deck-spec',
            pitch: -48,
            yaw: 60,
            title: 'Eva-Last Composite Architectural Decking',
            description: 'Zero-maintenance eco-composite timber decking with recessed floor uplighters.',
            type: 'material'
          }
        ]
      },
      {
        id: 'room-master',
        name: 'Primary Master Bedroom Sanctuary',
        tag: 'Master Bedroom',
        panoramaUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=2000&q=85',
        dimensionsM: { length: 5.2, width: 4.6, height: 3.1 },
        extentM2: 23.92,
        cameraPosition: { x: -4.5, y: 1.6, z: 4.0 },
        hotspots: [
          {
            id: 'hs-master-to-ensuite',
            targetRoomId: 'room-ensuite',
            targetRoomName: 'Luxury Ensuite Bathroom',
            pitch: 0,
            yaw: 90,
            label: 'Ensuite Bathroom'
          },
          {
            id: 'hs-master-to-terrace',
            targetRoomId: 'room-terrace',
            targetRoomName: 'Courtyard & Pool',
            pitch: -2,
            yaw: -105,
            label: 'Step Out to Courtyard'
          }
        ],
        interactivePins: [
          {
            id: 'pin-master-wardrobe',
            pitch: 0,
            yaw: -45,
            title: 'Floor-to-Ceiling Walk-Through Robes',
            description: 'Custom tinted glass wardrobe doors with integrated LED sensor illumination and velvet drawer organizers.',
            type: 'feature'
          }
        ]
      },
      {
        id: 'room-ensuite',
        name: 'Designer Spa Ensuite Bathroom',
        tag: 'Ensuite Bathroom',
        panoramaUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=85',
        dimensionsM: { length: 3.8, width: 3.2, height: 3.1 },
        extentM2: 12.16,
        cameraPosition: { x: -7.5, y: 1.6, z: 4.0 },
        hotspots: [
          {
            id: 'hs-ensuite-to-master',
            targetRoomId: 'room-master',
            targetRoomName: 'Master Bedroom',
            pitch: 0,
            yaw: -90,
            label: 'Return to Master Suite'
          }
        ],
        interactivePins: [
          {
            id: 'pin-ensuite-bath',
            pitch: -24,
            yaw: 15,
            title: 'Freestanding Mineral Cast Soaking Tub',
            description: 'Victoria + Albert volcanic limestone bath paired with Hansgrohe floor-mounted mixer.',
            type: 'material'
          },
          {
            id: 'pin-ensuite-shower',
            pitch: 4,
            yaw: -60,
            title: 'Frameless Walk-in Rain Shower',
            description: 'Dual ceiling-mounted Hansgrohe rain shower heads with linear floor drain and heated towel rails.',
            type: 'feature'
          }
        ]
      },
      {
        id: 'room-foyer',
        name: 'Heritage Entrance Hall & Foyer',
        tag: 'Exterior Front',
        panoramaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
        dimensionsM: { length: 4.2, width: 2.8, height: 3.2 },
        extentM2: 11.76,
        cameraPosition: { x: 0, y: 1.6, z: -4.0 },
        hotspots: [
          {
            id: 'hs-foyer-to-liv',
            targetRoomId: 'room-living',
            targetRoomName: 'Living Room',
            pitch: 0,
            yaw: 70,
            label: 'Enter Living Room'
          }
        ],
        interactivePins: [
          {
            id: 'pin-foyer-door',
            pitch: 0,
            yaw: -170,
            title: 'Smart Biometric Heritage Door',
            description: 'Restored solid teak entry door retrofitted with invisible biometric smart lock and intercom link.',
            type: 'spec'
          }
        ]
      }
    ]
  }
};

export function getVirtualTourByPropertyId(propertyId: string): Virtual3DTour {
  if (INITIAL_3D_TOURS[propertyId]) {
    return INITIAL_3D_TOURS[propertyId];
  }
  // Return default 5 Richmond Road tour with updated propertyId
  const defaultTour = JSON.parse(JSON.stringify(INITIAL_3D_TOURS['prop-1681']));
  defaultTour.propertyId = propertyId;
  return defaultTour;
}
