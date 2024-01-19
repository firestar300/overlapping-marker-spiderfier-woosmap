import './WoosmapSpiderifier.css'
import { eachFn, mapTimesFn, noop } from './utils'

const DEFAULT_OPTIONS = {
  animate: false, // to animate the spiral
  animationSpeed: 0, // animation speed in milliseconds
  customPin: false, // If false, sets a default icon for pins in spider legs.
  onInit: noop,
  onClick: noop,
  // --- <SPIDER TUNING Params>
  // circleSpiralSwitchover: show spiral instead of circle from this marker count upwards
  //                        0 -> always spiral; Infinity -> always circle
  circleSpiralSwitchover: 9,
  circleFootSeparation: 25, // related to circumference of circle
  spiralFootSeparation: 28, // related to size of spiral (experiment!)
  spiralLengthStart: 15, // ditto
  spiralLengthFactor: 4, // ditto
  // ---
}

/**
 * Main class
 */
class WoosmapSpiderifier {
  constructor(map, options) {
    if (typeof woosmap === 'undefined') {
      console.error('Woosmap is not defined.')
    }

    this.map = map
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.previousSpiderLegs = []
    this.createMarkerElements = createMarkerElements.bind(this)
    this.generateCircleParams = generateCircleParams.bind(this)
    this.generateSpiralParams = generateSpiralParams.bind(this)
    this.generateSpiderLegParams = generateSpiderLegParams.bind(this)
    this.each = function (callback) {
      eachFn(this.previousSpiderLegs, callback)
    }
  }

  /**
   * Display overlapping spiderfier from a group of features array
   *
   * @param {Object} latlng object of lat and lng
   *
   * @param {Array} features feature collection array
   */
  spiderfy(latlng, features) {
    const { options } = this
    const spiderLegParams = this.generateSpiderLegParams(features.length)

    this.unspiderfy()

    const spiderLegs = features.map((feature, index) => {
      const spiderLegParam = spiderLegParams[index]
      const woosmapMarker = new window.woosmap.map.Marker({
        position: new woosmap.map.LatLng(latlng),
      })
      const elements = this.createMarkerElements(spiderLegParam, woosmapMarker._element)

      const spiderLeg = {
        feature,
        elements,
        woosmapMarker,
        param: spiderLegParam,
      }

      options.onInit(spiderLeg)

      elements.container.onclick = function (e) {
        options.onClick(e, spiderLeg)
      }

      return spiderLeg
    })

    eachFn(spiderLegs.reverse(), (spiderLeg) => {
      spiderLeg.woosmapMarker.setMap(this.map)
    })

    if (options.animate) {
      setTimeout(function () {
        eachFn(spiderLegs.reverse(), function (spiderLeg, index) {
          spiderLeg.elements.container.className = (spiderLeg.elements.container.className || '').replace('initial', '')
          spiderLeg.elements.container.style['transitionDelay'] =
            (options.animationSpeed / 1000 / spiderLegs.length) * index + 's'
        })
      })
    }

    this.previousSpiderLegs = spiderLegs
  }

  /**
   * Hide current group of overlapping spiderfier
   */
  unspiderfy() {
    const { options } = this
    eachFn(this.previousSpiderLegs.reverse(), (spiderLeg, index) => {
      if (options.animate) {
        spiderLeg.elements.container.style['transitionDelay'] =
          (options.animationSpeed / 1000 / this.previousSpiderLegs.length) * index + 's'
        spiderLeg.elements.container.className += ' exit'
        setTimeout(function () {
          spiderLeg.woosmapMarker.setMap(null)
        }, options.animationSpeed + 100) //Wait for 100ms more before clearing the DOM
      } else {
        spiderLeg.woosmapMarker.setMap(null)
      }
    })
    this.previousSpiderLegs = []
  }
}

/**
 * Define spider leg param according to the count and circleSpiralSwitchover option
 *
 * @param {Number} count number of markers
 *
 * @returns {Function}
 */
function generateSpiderLegParams(count) {
  if (count >= this.options.circleSpiralSwitchover) {
    return this.generateSpiralParams(count)
  } else {
    return this.generateCircleParams(count)
  }
}

/**
 * Generate list of spiral leg params
 *
 * @param {Number} count
 *
 * @returns {Array.<{angle: Number, legLength: Number, x: Array, y: Number}>}
 */
function generateSpiralParams(count) {
  const {
    options: { spiralLengthStart, spiralFootSeparation, spiralLengthFactor },
  } = this
  const twoPi = Math.PI * 2
  let legLength = spiralLengthStart + 50
  let angle = 0
  return mapTimesFn(count, function (index) {
    angle = angle + (spiralFootSeparation / legLength + index * 0.0005)
    const pt = {
      x: legLength * Math.cos(angle),
      y: legLength * Math.sin(angle),
      angle,
      legLength,
      index,
    }
    legLength = legLength + (twoPi * spiralLengthFactor) / angle
    return pt
  })
}

/**
 * Generate list of circle leg params
 *
 * @param {Number} count
 *
 * @returns {Array.<{angle: Number, legLength: Number, x: Array, y: Number}>}
 */
function generateCircleParams(count) {
  const twoPi = Math.PI * 2
  const circumference = this.options.circleFootSeparation * (2 + count)
  const legLength = circumference / twoPi // = radius from circumference
  const angleStep = twoPi / count

  return mapTimesFn(count, function (index) {
    const angle = index * angleStep

    return {
      x: legLength * Math.cos(angle),
      y: legLength * Math.sin(angle),
      angle,
      legLength: legLength,
      index: index,
    }
  })
}

/**
 * Create HTML markup for spiderified markers
 *
 * @param {Array.<{angle: Number, legLength: Number, x: Array, y: Number}>} spiderLegParam
 *
 * @param {HTMLElement} markerElement
 *
 * @returns {{container: HTMLElement, line: HTMLElement, pin: HTMLElement}}
 */
function createMarkerElements(spiderLegParam, markerElement) {
  const { options } = this
  const containerElem = markerElement
  const pinElem = document.createElement('div')
  const lineElem = document.createElement('div')

  containerElem.querySelector('div').remove()
  containerElem.classList.add('spider-leg-container')

  if (options.animate) {
    containerElem.classList.add('animate', 'initial')
  }

  lineElem.className = 'spider-leg-line'
  pinElem.className = 'spider-leg-pin' + (options.customPin ? '' : ' default-spider-pin')

  containerElem.appendChild(lineElem)
  containerElem.appendChild(pinElem)

  containerElem.style['margin-left'] = spiderLegParam.x + 'px'
  containerElem.style['margin-top'] = spiderLegParam.y + 'px'

  lineElem.style.height = spiderLegParam.legLength + 'px'
  lineElem.style.transform = 'rotate(' + (spiderLegParam.angle - Math.PI / 2) + 'rad)'

  return { container: containerElem, line: lineElem, pin: pinElem }
}

export default WoosmapSpiderifier
