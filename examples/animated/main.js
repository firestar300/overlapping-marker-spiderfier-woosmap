import { WoosmapSpiderifier } from '../../src/'

const MAP_OPTIONS = {
  zoom: 7,
  center: {
    lat: 40,
    lng: -74.5,
  },
}

function initMap() {
  const map = new woosmap.map.Map(document.getElementById('map'), MAP_OPTIONS)

  const spiderifier = new WoosmapSpiderifier(map, {
    animate: true,
    animationSpeed: 600,
    spiralLengthFactor: 1.6,
  })

  fetch('./data.geojson')
    .then((response) => response.json())
    .then(({ features }) => {
      for (const feature of features) {
        const latlng = new window.woosmap.map.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
        const svg = window.btoa(`
        <svg fill="#2e86de" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
          <circle cx="120" cy="120" opacity=".8" r="70" />
          <circle cx="120" cy="120" opacity=".3" r="80" />
          <circle cx="120" cy="120" opacity=".2" r="110" />
        </svg>`)
        const iconSize = 65
        const marker = new window.woosmap.map.Marker({
          position: latlng,
          icon: {
            url: `data:image/svg+xml;base64,${svg}`,
            scaledSize: new window.woosmap.map.Size(iconSize, iconSize),
            anchor: {
              x: iconSize / 2,
              y: iconSize / 2,
            },
          },
          map,
        })

        marker.addListener('click', () => {
          const count = feature.properties.count
          const markers = new Array(count).fill('').map(() => feature)
          spiderifier.spiderfy(latlng, markers)

          return
        })
      }
    })
  map.addListener('click', () => {
    spiderifier.unspiderfy()
  })
  map.addListener('zoom_changed', () => {
    spiderifier.unspiderfy()
  })
}

window.initMap = initMap
