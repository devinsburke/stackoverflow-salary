class BAN {
    constructor({dataAccessor, filter, reducer, cssClass, parentNode, title}) {
        this.dataAccessor = dataAccessor
        this.filter = filter
        this.reducer = reducer
        this.element = parentNode
            .append('span')
                .classed('ban', true)
                .classed(cssClass, true)
                .attr('data-title', title)
                .attr('data-value', 0)
    }

    refresh() {
        const value = this
            .dataAccessor()
            .filter(this.filter)
            .reduce(this.reducer, 0)
        this.element.attr('data-value', BAN.#formatNumber(value))
    }

    static #formatNumber(num) {
        if (num >= 1000000)
            return (Math.trunc(num/1000000)).toLocaleString() + 'M'
        else if (num >= 1000)
            return (Math.trunc(num/1000)).toLocaleString() + 'K'
        return (Math.trunc(num*10)/10).toLocaleString()
    }
}
