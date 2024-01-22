import { WoosmapSpiderifier } from '../../src/'

const MAP_OPTIONS = {
  zoom: 16,
  center: {
    lat: 54.596963800000005,
    lng: -5.931764000000001,
  },
}
const SPIDERFY_FROM_ZOOM = 15
let markers = []

/**
 * Init woosmap map
 */
function initMap() {
  const map = new woosmap.map.Map(document.getElementById('map'), MAP_OPTIONS)

  const spiderifier = new WoosmapSpiderifier(map, {
    circleFootSeparation: 60,
    circleSpiralSwitchover: Infinity,
  })

  fetch('../data.geojson')
    .then((response) => response.json())
    .then(({ features }) => {
      for (const feature of features) {
        const latlng = new window.woosmap.map.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
        const marker = new window.woosmap.map.Marker({
          position: latlng,
          icon: {
            url: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0-beta.2/images/marker-icon.png',
            scaledSize: new window.woosmap.map.Size(25, 41),
          },
          map,
        })

        marker.addListener('click', () => {
          // Enable spiderfying when zoomed in more than SPIDERFY_FROM_ZOOM
          if (map.getZoom() > SPIDERFY_FROM_ZOOM) {
            spiderifier.spiderfy(latlng, features)

            return
          }
        })

        markers.push(marker)
      }
    })

  map.addListener('zoom_changed', () => {
    // Disable spiderfying when zoomed out
    if (map.getZoom() <= SPIDERFY_FROM_ZOOM) {
      spiderifier.unspiderfy()
    }
  })
}

window.initMap = initMap
