# Overlapping Marker Spiderfier for Woosmap

Extension to add overlapping marker spiderfier on Woosmap.
Spiderify markers on Woosmap using marker overlays. Note it does not create the spiderfication in the canvas but on a overlay on top of the canvas. This uses [`woosmap.map.Marker()`](https://developers.woosmap.com/products/map-api/guides/markers/) to create markers and spider legs.

Spiral/Circle positioning logic taken from and credits goes to [jawj/OverlappingMarkerSpiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier).

## Examples

- [Sample example](https://codesandbox.io/p/devbox/woosmap-spiderfier-9pw24s?file=/index.html)
- [Animated (WIP)](https://codesandbox.io/p/devbox/woosmap-spiderfier-animated-wnknnn?file=/index.html)
- [With clustering](https://codesandbox.io/p/devbox/woosmap-spiderfier-with-clustering-8j5swd?file=/index.html)
- [With infowindow](https://codesandbox.io/p/devbox/woosmap-spiderfier-with-infowindow-gt2qsp?file=/index.html)
- [With custom icon](https://codesandbox.io/p/devbox/woosmap-spiderfier-with-custom-icon-hxt6nv?file=/index.html)

## Get started

First, install dependency in your project.

```bash
yarn add @mit0ri/woosmap-spiderfier
```

Next, import the module in your JS file and instantiate `WoosmapSpiderifier`.

```js
import { WoosmapSpiderifier } from '@mit0ri/woosmap-spiderfier'

// Sample features array
const features = [
    { id: 0, type: 'car', color: 'red' },
    { id: 1, type: 'bicycle', color: '#ff00ff' },
    { id: 2, type: 'bus', color: 'blue' },
    { id: 3, type: 'cab', color: 'orange' },
    { id: 4, type: 'train', color: 'red' },
]

// Instantiate a Woosmap map
const map = new woosmap.map.Map(document.getElementById('map'), MAP_OPTIONS)

// Instantiate WoosmapSpiderifier with the map as first param and options as second param
const spiderifier = new WoosmapSpiderifier(map, {
    circleFootSeparation: 60,
    circleSpiralSwitchover: 10,
})

// Spiderfies and displays given markers on the specified lat lng.
spiderfier.spiderfy([-74.50, 40], features)

// On map click, unspiderfies markers if any spiderfied already.
map.addListener('click', () => {
    spiderfier.unspiderfy()
})
```

## Params

```js
new WoosmapSpiderifier(map, options)
```

| param     | description                                   |
|-----------|-----------------------------------------------|
| `map`     | Woosmap map instance `new woosmap.map.Map()`. |
| `options` | Options object. See below.                    |

## Options

| options                  | type       | default    | description                                                                                                   |
|--------------------------|------------|------------|---------------------------------------------------------------------------------------------------------------|
| `animate`                | _Boolean_  | `false`    | If `true`, the appearance and disappearance of markers will be animated.                                      |
| `animationSpeed`         | _Number_   | `200`      | Number in milliseconds. Ignored if animate is `false`.                                                        |
| `circleSpiralSwitchover` | _Number_   | `9`        | Number of markers till which the spider will be circular and beyond this threshold, it will spider in spiral. |
| `circleFootSeparation`   | _Number_   | `25`       | Related to circumference of circle.                                                                           |
| `spiralFootSeparation`   | _Number_   | `28`       | Related to size of spiral.                                                                                    |
| `spiralLengthStart`      | _Number_   | `15`       |                                                                                                               |
| `spiralLengthFactor`     | _Number_   | `4`        |                                                                                                               |
| `customPin`              | _Boolean_  | `false`    | If `false`, a custom icon will be displayed. If `true`, you have to provide a custom icon in your CSS file.   |
| `onInit`                 | _Function_ | `() => {}` | - @param0: `spiderLeg`                                                                                        |
| `onClick`                | _Function_ | `() => {}` | - @param0: `clickEvent` - @param1: `spiderLeg`                                                                |

## Functions

| function                     | params     | description                                                                                                                                                       |
|------------------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `spiderfy(latLng, features)` |            | Spiderfies and displays given markers on the specified lat lng.                                                                                                   |
|                              | `latLng`   | [`woosmap.map.LatLng(-122.420679, 37.772537)`]( https://developers.woosmap.com/products/map-api/reference/1.4/#woosmap.map.LatLng) or `[-122.420679, 37.772537]`. |
|                              | `features` | Array of plain objects.                                                                                                                                           |
| `unspiderfy()`               |            | Unspiderfies markers, if any spiderfied already.                                                                                                                  |
