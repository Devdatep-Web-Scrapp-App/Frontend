import { subDays, format, addDays } from 'date-fns'

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const firstNames = ['Carlos','Pedro','Ana','Maria','Luis','Sofia','Diego','Eduardo','Marco','Valentina','Kevin','Adriana','Sebastian','Stephanie','Antonio','Diana','Manuel','Julio','Lucia','Veronica','Camila','Pablo','Karla','Fernando','Lorena','Felipe','Roberto','Ignacio','Isabel','Rodrigo']
const lastNames  = ['Aguilar','Vargas','Paredes','Soto','Flores','Ramirez','Herrera','Fuentes','Medina','Cruz','Mora','Perez','Quispe','Campos','Ortiz','Silva','Salinas','Guerrero','Torres','Alva','Lara','Pinto','Meza','Gomez','Rojas','Vega']

function makeName() {
    const fn = firstNames[rnd(0, firstNames.length - 1)]
    const ln = lastNames[rnd(0, lastNames.length - 1)]
    return { full_name: `${fn} ${ln}`, username: `${fn.toLowerCase().slice(0,3)}${ln.toLowerCase().slice(0,3)}${rnd(100, 599)}` }
}

const START_DATE = subDays(new Date('2026-03-26'), 130)

let snapshotPool = []
let lostPool = []
let runningUsers = []
let nextId = 0

for (let d = 0; d <= 130; d++) {
    const date = addDays(START_DATE, d)
    const dateStr = format(date, 'yyyy-MM-dd')

    const base = d < 20 ? rnd(0, 3) : d < 60 ? rnd(1, 8) : d < 100 ? rnd(3, 14) : rnd(5, 60)

    for (let i = 0; i < base; i++) {
        const { full_name, username } = makeName()
        const u = { id: nextId++, username, full_name, scraped_at: dateStr }
        snapshotPool.push(u)
        runningUsers.push(u)
    }

    if (runningUsers.length > 10) {
        const lose = rnd(0, Math.min(3, Math.floor(runningUsers.length * 0.05)))
        for (let j = 0; j < lose; j++) {
            const idx = rnd(0, runningUsers.length - 1)
            const u = runningUsers.splice(idx, 1)[0]
            lostPool.push({ username: u.username, full_name: u.full_name, fecha_perdida: dateStr })
        }
    }
}

export const instagramSnapshot = snapshotPool
export const instagramLost     = lostPool

export function getKPIs(dateStart, dateEnd) {
    const snap  = instagramSnapshot.filter(r => r.scraped_at >= dateStart && r.scraped_at <= dateEnd)
    const lost  = instagramLost.filter(r => r.fecha_perdida >= dateStart && r.fecha_perdida <= dateEnd)
    const total = instagramSnapshot.length

    const byDay = {}
    instagramSnapshot.forEach(r => { byDay[r.scraped_at] = (byDay[r.scraped_at] || 0) + 1 })
    const bestDay = Object.entries(byDay).sort((a,b) => b[1]-a[1])[0]

    const days = Object.values(byDay)
    const avgDaily = days.length ? +(days.reduce((a,b)=>a+b,0)/days.length).toFixed(1) : 0

    const retention = total > 0 ? +((total / (total + instagramLost.length)) * 100).toFixed(1) : 0

    return {
        totalFollowers: total,
        newFollowers:   snap.length,
        lostFollowers:  lost.length,
        netGrowth:      snap.length - lost.length,
        bestDay:        bestDay ? bestDay[0] : null,
        bestDayPeak:    bestDay ? bestDay[1] : 0,
        avgDaily,
        retention,
    }
}

export function getGrowthHistory(dateStart, dateEnd) {
    const byDay = {}
    instagramSnapshot.forEach(r => {
        byDay[r.scraped_at] = (byDay[r.scraped_at] || 0) + 1
    })
    const lostByDay = {}
    instagramLost.forEach(r => {
        lostByDay[r.fecha_perdida] = (lostByDay[r.fecha_perdida] || 0) + 1
    })

    const allDates = [...new Set([...Object.keys(byDay), ...Object.keys(lostByDay)])].sort()

    let running = 0
    const rows = allDates.map(date => {
        running += (byDay[date] || 0) - (lostByDay[date] || 0)
        return { fecha: date, total_seguidores: running }
    })

    return rows.filter(r => r.fecha >= dateStart && r.fecha <= dateEnd)
}

export function getDailyBalance(dateStart, dateEnd) {
    const byDay = {}
    instagramSnapshot.filter(r => r.scraped_at >= dateStart && r.scraped_at <= dateEnd)
        .forEach(r => {
            if (!byDay[r.scraped_at]) byDay[r.scraped_at] = { fecha: r.scraped_at, nuevos: 0, perdidos: 0 }
            byDay[r.scraped_at].nuevos++
        })
    instagramLost.filter(r => r.fecha_perdida >= dateStart && r.fecha_perdida <= dateEnd)
        .forEach(r => {
            if (!byDay[r.fecha_perdida]) byDay[r.fecha_perdida] = { fecha: r.fecha_perdida, nuevos: 0, perdidos: 0 }
            byDay[r.fecha_perdida].perdidos++
        })

    return Object.values(byDay).sort((a,b) => a.fecha.localeCompare(b.fecha))
}