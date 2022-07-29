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
        this.element.attr('data-value', formatNumber(value))
    }
}
