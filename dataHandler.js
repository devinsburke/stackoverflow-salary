const frequency = { 'Monthly': 12, 'Weekly': 52, 'Yearly': 1 }

class DataHandler {
    #data

    constructor() {
        this.#data = null
        this.Data = null
    }

    async load(url) {
        this.#data = await d3.csv(url, DataHandler.#cleanRow)
        this.Data = this.#data
        return this
    }

    createParameterElements(container, parameters, onChangeCallback) {
        this.container = container
        this.parameters = parameters
        this.onChangeCallback = onChangeCallback
        
        for (const p of this.parameters) {
            const distinct =
                [...new Set(this.#data.map(d => d[p.field]))]
                .sort((a,b) => a - b)

            d3.select(this.container)
                .append('label')
                .text(p.title)
            d3.select(this.container)
                .append('select')
                    .on('change', e => {
                        p.value = e.currentTarget.value
                        this.#refreshData()
                    })
                    .selectAll()
                    .data(distinct)
                    .join('option')
                        .text(d => d)
                        .property('selected', d => d[p.field] == p.value)
        }
        this.#refreshData()
    }

    #refreshData() {
        this.Data = this.#data.filter(d => this.parameters.every(p => d[p.field] == p.value))
        this.onChangeCallback()
    }

    static #cleanRow(row) {
        const gender = row.Gender.split(';')
        return {
            MainBranch: row.MainBranch,
            Employment: row.Employment,
            Country: row.Country,
            US_State: row.US_State, // TODO: 
            Age: row.Age,           // TODO: 
            EdLevel: row.EdLevel == row.EdLevel.replace('â€™', `'`), // TODO:
            YearsCodePro: row.YearsCodePro == 'Less than one year'
                ? 0.5
                : parseInt(row.YearsCodePro), // TODO: 
            ConvertedCompYearly: DataHandler.#estimateCompensation(row), // TODO:
            Gender: gender, // TODO: 
            IsMan: gender.includes('Man'),
            IsWoman: gender.includes('Woman')
        }
    }

    static #estimateCompensation(row) {
        let usdTotalComp = parseInt(row.ConvertedCompYearly)
        if (!usdTotalComp) {
            // If they reported $0, treat it as omitted.
            usdTotalComp = NaN
        } else if (usdTotalComp > 500000) {
            // If the calculated total is >$500K, consider that they probably
            // filled it out wrong. Many users left the 'frequency' as Weekly
            // or Monthly yet entered their annual compensation.
            usdTotalComp /= frequency[row.CompFreq]
        } else if (
            usdTotalComp <= 5000
            && row.Country == 'United States of America'
            && row.Employment == 'Employed full-time'
            && row.MainBranch == 'I am a developer by profession'
            && parseInt(row.CompTotal) <= 500
        ) {
            // If the user is a full time US developer who supposedly makes
            // less than $5K/yr., consider that they may have filled it out
            // wrong. Many users entered their compensation in thousands.
            usdTotalComp = parseInt(row.CompTotal) * 1000
        }
        return usdTotalComp
    }
}