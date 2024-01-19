import { WoosmapSpiderifier } from '../../src/'
import Marker from './marker.svg'

const MAP_OPTIONS = {
  zoom: 16,
  center: {
    lat: 54.596963800000005,
    lng: -5.931764000000001,
  },
}
const SPIDERFY_FROM_ZOOM = 15
let markers = []
let selectedMarker = null

/**
 * Init woosmap map
 */
function initMap() {
  const map = new woosmap.map.Map(document.getElementById('map'), MAP_OPTIONS)

  const spiderifier = new WoosmapSpiderifier(map, {
    circleFootSeparation: 60,
    circleSpiralSwitchover: Infinity,
    customPin: true,
    onInit: function ({ woosmapMarker }) {
      woosmapMarker._element.classList.add('custom-marker')
    },
    onClick: function (e, { woosmapMarker }) {
      if (selectedMarker) {
        selectedMarker._element.classList.remove('custom-marker--selected')
      }
      woosmapMarker._element.classList.add('custom-marker--selected')
      selectedMarker = woosmapMarker
    },
  })

  fetch('../data.geojson')
    .then((response) => response.json())
    .then(({ features }) => {
      for (const feature of features) {
        const latlng = new window.woosmap.map.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
        const marker = new window.woosmap.map.Marker({
          position: latlng,
          icon: {
            url: Marker,
            scaledSize: new window.woosmap.map.Size(50, 50),
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
