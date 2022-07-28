const defaultLayout = {
    height: 200,
    width: 400,
    marginBottom: 35,
    marginLeft: 40,
    marginRight: 8,
    marginTop: 5,
}
const defaultParameters = [
    {
        title: 'Status',
        type: 'select',
        value: 'I am a developer by profession',
        field: 'MainBranch',
    },
    {
        title: 'Employment',
        type: 'select',
        value: 'Employed full-time',
        field: 'Employment',
    },
    {
        title: 'Country',
        type: 'select',
        value: 'United States of America',
        field: 'Country',
    },
    {
        title: 'Education',
        type: 'select',
        value: null,
        field: 'EdLevel',
    },
    {
        title: 'Age',
        type: 'select',
        value: null,
        field: 'Age',
    },
    {
        title: 'Women Only',
        type: 'toggle',
        value: false,
        field: 'IsWoman'
    },
    {
        title: 'Compensation',
        type: 'range',
        value: 1000000, // Hard coded ceiling
        field: 'ConvertedCompYearly',
        textBefore: 'Up to $',
        textAfter: ' USD'
    },
    {
        title: 'Experience',
        type: 'range',
        value: null,
        field: 'YearsCodePro',
        textBefore: 'Up to ',
        textAfter: ' years'
    }
]

window.addEventListener('DOMContentLoaded', async() => {
    const dataHandler = await new DataHandler().load('./data.csv')
    const visualizations = []
    await dataHandler.createParameterElements(
        '#parameters',
        defaultParameters,
        () => visualizations.forEach(v => v.refresh())
    )

    visualizations.push(
        new BAN({
            dataAccessor: () => dataHandler.Data,
            filter: d => d.IsWoman,
            reducer: (b, a) => b + 1,
            cssClass: 'target highlight',
            parentNode: d3.select('#bans'),
            title: 'Women',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly),
            filter: d => d.IsWoman,
            reducer: (a,b,i) => a+(b.ConvertedCompYearly-a)/(i+1),
            cssClass: 'target',
            parentNode: d3.select('#bans'),
            title: 'Compensation',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.YearsCodePro),
            filter: d => d.IsWoman,
            reducer: (a,b,i) => a+(b.YearsCodePro-a)/(i+1),
            cssClass: 'target',
            parentNode: d3.select('#bans'),
            title: 'Experience (yrs.)',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly && d.YearsCodePro),
            filter: d => d.IsWoman,
            reducer: (a,b,i) => a+((b.ConvertedCompYearly / b.YearsCodePro)-a)/(i+1),
            cssClass: 'target',
            parentNode: d3.select('#bans'),
            title: 'Pay:Years Ratio',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data,
            filter: d => !d.IsWoman,
            reducer: (b, a) => b + 1,
            cssClass: 'highlight',
            parentNode: d3.select('#bans'),
            title: 'Non-Women',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly),
            filter: d => !d.IsWoman,
            reducer: (a,b,i) => a+(b.ConvertedCompYearly-a)/(i+1),
            cssClass: '',
            parentNode: d3.select('#bans'),
            title: 'Compensation',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.YearsCodePro),
            filter: d => !d.IsWoman,
            reducer: (a,b,i) => a+(b.YearsCodePro-a)/(i+1),
            cssClass: '',
            parentNode: d3.select('#bans'),
            title: 'Experience (yrs.)',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly && d.YearsCodePro),
            filter: d => !d.IsWoman,
            reducer: (a,b,i) => a+((b.ConvertedCompYearly / b.YearsCodePro)-a)/(i+1),
            cssClass: '',
            parentNode: d3.select('#bans'),
            title: 'Pay:Years Ratio',
        }),
        new Plotter({
            dataAccessor: () => dataHandler.Data,
            keyAccessor: d => d.ResponseId,
            refreshCallback: populateScatterplot,
            parentNode: d3.select('#scatterplot'),
            cssClass: 'scatterplot',
            //title: 'Gender Distribution by Compensation and Experience',
            layout: defaultLayout,
            x: new Axis('ConvertedCompYearly', 'Annual Compensation (USD)'),
            y: new Axis('YearsCodePro', 'Experience (Years)'),
        })
    )

    await IntroScene()
    await ShowScene()
})



async function annotate(text, description, position, delayMs) {
    const annotation = d3.select('body')
        .append('div')
        .attr('class', 'annotation')
        .text(text)
    for (const k in position)
        annotation.style(k, position[k])
    annotation.transition().style('transform', '')
    d3.select('#description')
        .text(description)
    d3.select('#progress')
        .transition()
            .duration(delayMs)
            .style('right', '0')
    await new Promise(r => setTimeout(r, delayMs))
    annotation.classed('done', true)
    d3.select('#progress').style('right', '')
    await new Promise(r => setTimeout(r, 1000))
}

async function setParameter(name, value, delayMs) {
    const el = document.getElementById(`parameter-${name}`)
    el.value = value || el.getAttribute('max') || ''
    el.dispatchEvent(new Event('change'))
    await new Promise(r => setTimeout(r, delayMs))
}

async function pause(ms) {
    return new Promise(r => setTimeout(r, ms))
}

async function IntroScene() {
    return new Promise(r => {
        d3.select('#intro')
            .classed('loading', false)
            .on('click', e => {
                d3.select(e.currentTarget)
                    .transition().style('top', '-100vh')
                    .transition().style('display', 'none')
                    .on('end', r)
            })
    })
}

async function ShowScene() {
    const scenes = [
        Scene1,
        Scene2,
        Scene3,
        Scene4,
        Scene5,
        Scene6
    ]

    const navigation = d3.select('#navigation')
    const description = d3.select('#description')

    let i = 0
    while (i < scenes.length) {
        await new Promise(r => setTimeout(r, 1000))

        d3.select('#backButton')
            .text(`Back to Slide ${i}`)
            .style('visibility', i ? 'visible' : 'hidden')
        d3.select('#replayButton')
            .text(`Replay Slide ${i+1}`)
        d3.select('#nextButton')
            .text(`Continue to Slide ${i+2}`)

        await scenes[i]()

        description.classed('hidden', true)

        const cmd = await new Promise(r => navigation
            .selectAll('button')
            .on('click', e => r(e.currentTarget.getAttribute('data-cmd')))
        )
        d3.selectAll('.annotation').remove()

        description.text('')
        description.classed('hidden', false)

        if (cmd == 'next')
            i++
        else if (cmd == 'back')
            i--
    }

    d3.selectAll('#scatterplot, #parameters')
        .classed('interactive', true)
}

async function Scene1() {
    const isWoman = document.getElementById('parameter-IsWoman')
    isWoman.checked = false
    isWoman.click()
    await pause(2000)

    await annotate('541 survey participants were women in the US working fulltime as developers', 
    'Note our filters on the left side, set to the US, fulltime, developers, and women-only.',
    {
        right: '10%',
        top: '1rem',
        width: '20rem'
    }, 5000)
    await annotate('Average total compensation is $117K USD annually',
    '$117K USD seems like a good salary, but we will see how it compares to other salaries on the next slide.',
    {
        right: '10%',
        top: '6rem',
        width: '25rem'
    }, 5000)
}

async function Scene2() {
    const isWoman = document.getElementById('parameter-IsWoman')
    isWoman.checked = true
    isWoman.click()
    await pause(2000)

    await annotate('However, when we add their 7,000 non-women peers (men, non-binary, etc.), we realize that these 541 women only constitute 7% of the US software development workforce.', {
        right: '10%',
        top: '50%',
        width: '30rem'
    }, 4000)
    await annotate('And that $117K average compensation is a lot less exciting when compared to the $141K their peers earn on average.', {
        right: '10%',
        top: '65%',
        width: '20rem'
    }, 5000)
    await annotate('But we haven\'t considered differences in experience. Look at the Pay-to-Years Ratios to the right: women earn $22K per year of professional experience, which is $3K more than their counterparts, who earn $19K. Does this mean the average woman is paid better but simply earlier in her career...?', {
        right: '10%',
        top: '80%',
        width: '40rem'
    }, 6000)
}

async function Scene3() {
    await annotate('To answer that, let\'s see how women are paid when first entering the workforce.', {
        left: '20%',
        top: '33%',
        width: '20rem'
    }, 3000)
    await annotate('Next, let\'s limit compensation to $300K and experience to 8 years, to remove anomolies that skew the data.', {
        left: '2.5%',
        top: '68%',
        width: '20rem'
    }, 3000)
    await setParameter('Age', '18-24 years old', 1500)
    await setParameter('ConvertedCompYearly', 300000, 1500)
    await setParameter('YearsCodePro', 8, 2000)
    await annotate('Notice that average pay in this age group is basically equal for women and their peers: $93K vs. $94K. And women still earn more per year of professional experience.', {
        right: '10%',
        top: '30%',
        width: '20rem'
    }, 4000)
}

async function Scene4() {
    await annotate('We now adjust the age range to 25-34, and raise the compensation and experience ranges to $400K and 17 years, respectively, to accomodate changes in the data while still excluding outliers.', {
        left: '2.5%',
        top: '65%',
        width: '25rem'
    }, 3000)
    await setParameter('Age', '25-34 years old', 1500)
    await setParameter('ConvertedCompYearly', 400000, 2000)
    await setParameter('YearsCodePro', 17, 2000)
    await annotate('By age 25-34, women are compensated 10% less than their peers and no longer earn more for experience.', {
        right: '10%',
        top: '10%',
        width: '20rem'
    }, 3000)
    await annotate('The downward trend continues, with 35-44 year old women earning 17% less than their peers, and 45-54 year olds earning 22% less (not shown).', {
        right: '10%',
        top: '30%',
        width: '25rem'
    }, 3000)
}

async function Scene5() {
    await annotate('Finally, we will review whether the highest levels of education help bridge the compensation gap.', {
        right: '10%',
        top: '10%',
        width: '20rem'
    }, 3000)
    await annotate('We filter on doctoral degree as education level, and reset our other previous filters.', {
        left: '2.5%',
        top: '65%',
        width: '25rem'
    }, 3000)
    await setParameter('EdLevel', 'Other doctoral degree (Ph.D., Ed.D., etc.)', 1000)
    await setParameter('Age', '', 1000)
    await setParameter('ConvertedCompYearly', null, 1000)
    await setParameter('YearsCodePro', null, 1000)
    await annotate('It does not. Unfortunately, women holding doctoral degrees earn 22% less than their peers with similar degrees.', {
        right: '10%',
        top: '30%',
        width: '25rem'
    }, 3000)
    await annotate('And although women appear to get advanced degrees earlier in their careers, this does not explain the discrepency. Women with doctoral degrees barely earn more than half what their peers earn ($11K vs. $21K) per year of experience.', {
        right: '10%',
        top: '45%',
        width: '30rem'
    }, 4000)
}

async function Scene6() {
    await setParameter('EdLevel', '', 1500)
    await annotate('In sum, we have seen that women are underrepresented in software development, are compensated less than their counterparts, and that pay inequality becomes worse with age and experience.', {
        right: '10%',
        top: '10%',
        width: '30rem'
    }, 7000)
    await annotate('Now it\'s your turn. On the next slide, you will be able to adjust the filters on the left yourself, as well as hover over the circles on the chart to see more detail. See what observations you can make.', {
        left: '50%',
        top: '50%',
        width: '35rem'
    }, 5000)
}
