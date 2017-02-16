import _ from 'lodash'
const clientId = 'GVXLP5ATUI2VAMBIYRBA15QWCTFKS2FD3Q4JU02DPHIZTW51'
const clientSecret = '0REDFUUZJCM2DKHEJOCGMKXNXAQSANMBXPBLVS24QPUZSKXR'
const categoriesId = [
  '4d4b7105d754a06374d81259',
  '4d4b7105d754a06376d81259',
]
export default() => {
  return {
    api: 'https://api.foursquare.com/v2/venues',
    getPhotos: async function getPhotos(id) {
      let url = this.api + '/' + id + '/photos'
      url += `?client_id=${clientId}&client_secret=${clientSecret}`
      const date = new Date()
      let month = date.getMonth()
      let day = date.getDate()
      if (day < 10) day = '0' + day
      if (month < 10) month = '0' + month
      url += `&v=${date.getFullYear()}${month}${day}`
      // console.log(url)
      url = encodeURI(url)
      const response = await fetch(url)
      const data = await response.json()
      const photos = []
      if (data && data.response && data.response.photos && data.response.photos.items) {
        data.response.photos.items.forEach((photo) => {
          const photoUrl = photo.prefix + photo.width + 'x' + photo.height + photo.suffix
          photos.push(photoUrl)
        })
      }
      return photos
    },
    get: async function get(id) {
      let url = this.api + '/' + id
      url += `?client_id=${clientId}&client_secret=${clientSecret}`
      const date = new Date()
      let month = date.getMonth()
      let day = date.getDate()
      if (day < 10) day = '0' + day
      if (month < 10) month = '0' + month
      url += `&v=${date.getFullYear()}${month}${day}`
      url = encodeURI(url)
      const response = await fetch(url)
      const data = await response.json()

      let venue = null
      if (data && data.response && data.response.venue) {
        const photos = await this.getPhotos(id)
        const photo = photos[0] || null
        const _venue = data.response.venue
        venue = {
          id : _venue.id,
          name: _venue.name,
          address: _venue.location.address,
          lat: _venue.location.lat,
          lng: _venue.location.lng,
          price: 0,
          photo,
        }
      }
      return venue
    },
    search: async function(params) {
      const { query, lat, lng } = params
      // const { query } = params
      // const lat = 59.934280
      // const lng = 30.335099
      let url = this.api
      url += `/search?client_id=${clientId}&client_secret=${clientSecret}`
      if (lat && lng) url += '&ll=' + lat + ',' + lng
      if (query) url += '&query=' + query

      const date = new Date()
      let month = date.getMonth()
      let day = date.getDate()
      if (day < 10) day = '0' + day
      if (month < 10) month = '0' + month
      url += `&v=${date.getFullYear()}${month}${day}`
      const categories = params.categories || categoriesId
      url += `&categoryId=${categories.join(',')}`
      // console.log(url)
      url = encodeURI(url)
      const response = await fetch(url)
      const data = await response.json()
      let venues = []
      // console.log(data.data)
      if (data && data.response && data.response.venues) {
        venues = data.response.venues
      }
      venues = venues.map((venue) => {
        return {
          id: venue.id,
          name: venue.name,
          address: venue.location.address,
          lat: venue.location.lat,
          lng: venue.location.lng,
        }
      })
      // console.log(venues)
      return venues
    }
  }
}
