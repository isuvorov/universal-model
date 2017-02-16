/* eslint-disable */
import _ from 'lodash'
export const R = 6371

export function deg2rad(deg) {
  return deg * (Math.PI / 180)
}
function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

export function getDistance(point1, point2) {
  const vector = {
    lat: deg2rad(point2.lat - point1.lat),
    lng: deg2rad(point2.lng - point1.lng),
  }
  const a =
    Math.sin(vector.lat / 2) * Math.sin(vector.lat / 2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
    Math.sin(vector.lng / 2) * Math.sin(vector.lng / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  // console.log('point1, point2', point1, point2, d);
  return d;
}


// @TODO replace 1 km
export function showOnlyUsers(params) {
  return params.distance < 1
}

export function getCellSize(params) {
  const { distance, grid }  = params

  const sizeMultiplicator = 1
  const sizeBase = 1 / 50
  const distanceBase = 1
  const distanceMultiplicator = 2
  // if (grid) {
  //   return { dlat: grid, dlng: grid }
  // }
  let size = sizeBase

  let ii = Math.floor(getBaseLog(distanceMultiplicator, distance / distanceBase)) + 1 // @todo round
  if (ii < 1) ii = 1;

  // let i = 1;
  // while(distanceBase * Math.pow(distanceMultiplicator, (i - 1)) < distance) {
  //   i += 1;
  // }

  // @TODO replace function
  // size = sizeBase * ii
  // size = Math.pow(sizeBase, 1/(ii*2))
  // size = getBaseLog(sizeBase, ii)
  // console.log({ size })
  size = sizeBase * ii * ii
  // size = Math.pow(sizeBase, ii)
  if (ii >= 14) {
    size = 32
  } else if (ii >= 13) {
    size = 16
  } else if (ii >= 12) {
    size = 8
  } else if (ii >= 11) {
    size = 4
  } else if (ii >= 10) {
    size = 2
  } else if (ii >= 9) {
    size = 1
  } else if (ii >= 8) {
    size = 0.5
  } else if (ii >= 7) {
    size = 0.25
  } else if (ii >= 6) {
    size = 0.2
  } else if (ii >= 5) {
    size = 0.1
  } else if (ii >= 4) {
    size = 0.05
  } else if (ii >= 3) {
    size = 0.01
  } else if (ii >= 2) {
    size = 0.005
  } else if (ii >= 1) {
    size = 0.001
  }
  console.log({distance, ii, size});


  // if (distance < 1) {
  //   size =  1 / 1024
  // } else if (distance < 2) {
  //   size =  1 / 512
  // } else if (distance < 5) {
  //   size =  1 / 256
  // } else if (distance < 10) {
  //   size =  1 / 128
  // } else if (distance < 20) {
  //   size =  1 / 64
  // } else if (distance < 40) {
  //   size =  1 / 32
  // } else if (distance < 90) {
  //   size =  1 / 16
  // } else if (distance < 250) {
  //   size =  1 / 8
  // } else if (distance < 500) {
  //   size =  1 / 4
  // } else if (distance < 1000) {
  //   size =  1 / 2
  // } else if (distance < 2000) {
  //   size =  1
  // } else if (distance < 4000) {
  //   size =  2
  // }
  //
  // size *= 2
  // console.log({ size })
  //
  return { dlat: size / 2, dlng: size   }
}

export function getClusterByLatLng(params) {
  const { dlat, dlng, lat, lng } = params

  const cluster = {
    lat: Math.floor(lat / dlat) * dlat,
    lng: Math.floor(lng / dlng) * dlng,
  }
  cluster.id = cluster.lat + '_' + cluster.lng
  // console.log({ dlat, dlng, lat, lng, id: cluster.id} );
  return cluster
}

export function getBestUserFromCluster(users) {
  // console.log('getBestUserFromCluster', users.map(u => u.distance), _.minBy(users, (user) => user.distance).distance);
  return _.minBy(users, (user) => user.distance)
}

export default (users, params) => {
  const {lat, lng, distance, limit = 12} = params


  // @TODO replace 10 users

  if (users.length < 10 || showOnlyUsers(params)) {
    // console.log({ users: users.length }, 'users < 10');
    return users
  }
  /// if 10
  // if (showOnlyUsers(params)) {
  //   return users
  // }



  const { dlat, dlng } = getCellSize(params)
  // console.log({dlat, dlng});


  const usersWithClusters = users.map(user => {
    const cluster = getClusterByLatLng({dlat, dlng, lat: user.lat,  lng: user.lng})
    return {
      cluster,
      distance: getDistance(cluster, user),
      ...user.toJSON(),
    };
  })

  const clusters = _.groupBy(usersWithClusters, 'cluster.id')


  const clusterWithUsers = _.map(clusters, users => {
    const user = getBestUserFromCluster(users) //  пока сделаем по _.min(users, 'distance') , потом подумаем
    // user.lat = user.cluster.lat
    // user.lng = user.cluster.lng
    return {
      type: 'cluster',
      user,
      users,
      lng: user.cluster.lng,
      lat: user.cluster.lat,
    }
  })


  // @TODO мониторинг результата => 5-9
  // console.log(JSON.stringify({...params, ...{ dlat, dlng }, users: users.length, clusterWithUsers: clusterWithUsers.length}, null, 4))
  // ...{ dlat, dlng }
  // console.log(JSON.stringify({users: users.length, clusterWithUsers: clusterWithUsers.length}, null, 4))
  return clusterWithUsers

}
//
// Игорь Суворов, [25.12.16 23:39]
// 0 - 10    z = 1
// 10 - 40   z = 2
// 40 - 250  z = 3
// 250 - 1000  z = 4
// 1000 - 4000 z  = 5
//
// Игорь Суворов, [25.12.16 23:39]
// перевод distance в  масштаб
//
// Игорь Суворов, [25.12.16 23:40]
// при z = 5 , кваждрат "кластеризации"  2х2 кластера
//
// Игорь Суворов, [25.12.16 23:41]
// z = 5, 2 г
// z = 4, 1/2 г
// z = 3, 1/8 г
// z = 2, 1/32 г
// z = 1, 1/128 г
//
//
// if (showOnlyUsers()) {  //  if distance < 10km
// 	return users
// }
//
// const { dlat, dlng } = getCellSize(lat, lng, distance, count) //  получаем размер кластерной сетки в зависимости от того,
// // 1) на какной дистанции смотрим
// // 2) сколько нам нужно кластеров
// // 3) размерность  в градусах для этого участка земли (компенсируем отношение грудусов к километрам на полюсах)
//
//
// const usersWithClusters = users.map(user => {
//
// 	const cluster = getClusterByLatLng({dlat, dlng, ...user})  // получаем ближайший кластер для юзера (  в том квадрате в котором находится юзер )
//
//
//
// 	const clusterId = cluster.lat + '_' + cluster.lng
//
//
//
// 	return {
//
// 		cluster,
// 		clusterId,
// 		distance: getDistance(cluster, user),
//
// 		...user
// 	}
// })
//
// // группируем пользователей по принадлежности кластерам
// const clusters = _.groupBy(usersWithClusters, 'clusterId')
//
//
// return _.map(clusters, users => {
//
// 	const user = getSuperUserFromCluster(users) //  пока сделаем по _.min(users, 'distance') , потом подумаем
//
//
// 	return {
// 		user: user,
// 		count: users.count,
// 		lng: user.lng, //  пока центр кластера пусть будет центр юзера, потом попробуем еще {lng : user.cluster.lng}
// 		lat: user.lat,
// 	}
//
// })
