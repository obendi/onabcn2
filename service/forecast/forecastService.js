import { parse as htmlParse } from 'node-html-parser'

export default async function getData() {

    const fetchResponse = await fetch('https://bancodatos.puertos.es/TablaAccesoSimplificado/util/get_wanadata.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: 'point=2111136&name=Barcelona'
    })

    const text = await fetchResponse.text()

    const root = htmlParse(text)
    const tbody = root.getElementsByTagName('tbody')[0]
    const rows = tbody.getElementsByTagName('tr')

    const forecastList = []
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const columns = row.getElementsByTagName('td')

        const forecast = {}

        for (let j = 0; j < columns.length; j++) {
            const column = columns[j]

            const position = j.toString()

            switch (position) {
                // Time
                case '0':
                    forecast.datetime = column.text
                    break
                
                // Wind
                case '2':
                    forecast.windVelocity = column.text
                    break
                case '3':
                    forecast.windDirection = column.text
                    break

                // Total swell
                case '4':
                    forecast.totalSwellHeight = column.text
                    break

                // Wind swell
                case '8':
                    forecast.windSwellHeight = column.text
                    break
                case '9':
                    forecast.windSwellDirection = column.text
                    break

                //Primary swell
                case '10':
                    forecast.primarySwellHeight = column.text
                    break

                case '11':
                    forecast.primarySwellDirection = column.text
                    break

                case '12':
                    forecast.primarySwellPeriod = column.text
                    break
            
            }
        }

        forecastList.push(forecast)
    }

    return forecastList
}