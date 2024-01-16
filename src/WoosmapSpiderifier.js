const noop = function () {}
const UTILS = {
  each: eachFn,
  mapTimes: mapTimesFn,
  eachTimes: eachTimesFn,
}
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
      UTILS.each(this.previousSpiderLegs, callback)
    }
  }

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

    UTILS.each(spiderLegs.reverse(), (spiderLeg) => {
      spiderLeg.woosmapMarker.setMap(this.map)
    })

    if (options.animate) {
      setTimeout(function () {
        UTILS.each(spiderLegs.reverse(), function (spiderLeg, index) {
          spiderLeg.elements.container.className = (spiderLeg.elements.container.className || '').replace('initial', '')
          spiderLeg.elements.container.style['transitionDelay'] =
            (options.animationSpeed / 1000 / spiderLegs.length) * index + 's'
        })
      })
    }

    this.previousSpiderLegs = spiderLegs
  }

  unspiderfy() {
    const { options } = this
    UTILS.each(this.previousSpiderLegs.reverse(), function (spiderLeg, index) {
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

function generateSpiderLegParams(count) {
  if (count >= this.options.circleSpiralSwitchover) {
    return this.generateSpiralParams(count)
  } else {
    return this.generateCircleParams(count)
  }
}

function generateSpiralParams(count) {
  const { options } = this
  const twoPi = Math.PI * 2
  const legLength = options.spiralLengthStart + 50
  let angle = 0
  return UTILS.mapTimes(count, function (index) {
    angle = angle + (options.spiralFootSeparation / legLength + index * 0.0005)
    const pt = {
      x: legLength * Math.cos(angle),
      y: legLength * Math.sin(angle),
      angle,
      legLength,
      index,
    }
    legLength = legLength + (twoPi * options.spiralLengthFactor) / angle
    return pt
  })
}

function generateCircleParams(count) {
  const twoPi = Math.PI * 2
  const circumference = this.options.circleFootSeparation * (2 + count)
  const legLength = circumference / twoPi // = radius from circumference
  const angleStep = twoPi / count

  return UTILS.mapTimes(count, function (index) {
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

// Utility
function eachFn(array, iterator) {
  let i = 0
  if (!array || !array.length) {
    return []
  }
  for (i = 0; i < array.length; i++) {
    iterator(array[i], i)
  }
}

function eachTimesFn(count, iterator) {
  if (!count) {
    return []
  }
  for (var i = 0; i < count; i++) {
    iterator(i)
  }
}

function mapTimesFn(count, iterator) {
  let result = []
  eachTimesFn(count, function (i) {
    result.push(iterator(i))
  })
  return result
}

export default WoosmapSpiderifier