import Supercluster from 'https://cdn.skypack.dev/supercluster'
import { WoosmapSpiderifier } from '../../src/'
import { debounce } from '../utils'

let map = null
let index = null
let spiderifier = null
let markers = []
const MAP_OPTIONS = {
  zoom: 6,
  center: {
    lat: 54.596963800000005,
    lng: -5.931764000000001,
  },
}
const SPIDERFY_FROM_ZOOM = 15

function initMap() {
  map = new woosmap.map.Map(document.getElementById('map'), MAP_OPTIONS)
  spiderifier = new WoosmapSpiderifier(map, {
    circleFootSeparation: 60,
    circleSpiralSwitchover: Infinity,
  })

  fetch('https://demo.woosmap.com/misc/data/uk-all-pubs.geojson')
    .then((response) => response.json())
    .then(({ features }) => {
      index = new Supercluster({
        radius: 40,
        extent: 256,
        maxZoom: 24,
        minPoints: 5,
      }).load(features)

      update()
    })

  map.addListener(
    'dragend',
    debounce(() => {
      update()
    }, 20)
  )

  map.addListener(
    'zoom_changed',
    debounce(() => {
      // Disable spiderfying when zoomed out
      if (map.getZoom() <= SPIDERFY_FROM_ZOOM) {
        spiderifier.unspiderfy()
      }

      update()
    }, 20)
  )

  window.addEventListener(
    'resize',
    debounce(() => {
      update()
    }, 100)
  )
}

/**
 * Update clusters
 */
function update() {
  for (const marker of markers) {
    marker.setMap(null)
  }
  markers = []
  const bounds = map.getBounds()
  const bbox = [
    bounds.getSouthWest().lng(),
    bounds.getSouthWest().lat(),
    bounds.getNorthEast().lng(),
    bounds.getNorthEast().lat(),
  ]

  const clusterData = index.getClusters(bbox, map.getZoom())

  for (const feature of clusterData) {
    const latlng = new window.woosmap.map.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])

    markers.push(createClusterIcon(feature, latlng))
  }
}

/**
 * Create cluster markers icons
 *
 * @param {Object} feature
 *
 * @param {Array} latlng
 *
 * @returns {Object} Woosmap marker object
 */
function createClusterIcon(feature, latlng) {
  if (!feature.properties.cluster) {
    const marker = new window.woosmap.map.Marker({
      position: latlng,
      icon: {
        url: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0-beta.2/images/marker-icon.png',
        scaledSize: new window.woosmap.map.Size(25, 41),
      },
      map,
    })

    return marker
  }

  const count = feature.properties.point_count
  const color = count < 80 ? '#ee5253' : count < 500 ? '#ff9f43' : '#ee5253'
  const size = count < 80 ? 45 : count < 400 ? 55 : 65

  const svg = window.btoa(`
<svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <circle cx="120" cy="120" opacity=".8" r="70" />
  <circle cx="120" cy="120" opacity=".3" r="80" />
  <circle cx="120" cy="120" opacity=".2" r="110" />
</svg>`)

  const marker = new window.woosmap.map.Marker({
    labelOrigin: new window.woosmap.map.Point(13.2, 15),
    label: {
      text: feature.properties.point_count_abbreviated,
      color: 'white',
    },
    position: latlng,
    icon: {
      url: `data:image/svg+xml;base64,${svg}`,
      scaledSize: new window.woosmap.map.Size(size, size),
    },
    map,
  })

  marker.addListener('click', () => {
    // Enable spiderfying when zoomed in more than SPIDERFY_FROM_ZOOM
    if (map.getZoom() > SPIDERFY_FROM_ZOOM) {
      spiderifier.spiderfy(latlng, index.getChildren(feature.properties.cluster_id))

      return
    }

    const expansionZoom = index.getClusterExpansionZoom(feature.properties.cluster_id)
    map.setCenter(marker.getPosition())
    map.setZoom(expansionZoom)
  })

  return marker
}

window.initMap = initMap
