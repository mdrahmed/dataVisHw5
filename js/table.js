/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object 
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData;
        this.tableData = [...forecastData];
        this.originalTableData = [...forecastData]; // this data will be used after collapsing the table
        // add useful attributes
        for (let forecast of this.tableData)
        {
            forecast.isForecast = true;
            forecast.isExpanded = false;
        }
        this.pollData = pollData;
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'state'
            },
            {
                sorted: false,
                ascending: false,
                key: 'mean_netpartymargin',
                alterFunc: d => Math.abs(+d)
            },
            {
                sorted: false,
                ascending: false,
                key: 'winner_Rparty',
                alterFunc: d => +d
            },
        ]

        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);
        this.attachSortHandlers();
        this.drawLegend();
    }

    drawLegend() {
        ////////////
        // PART 2 //
        ////////////
        /**
         * Draw the legend for the bar chart.
         */
        let margin_svg = d3.select("#marginAxis")
                            .attr("width",this.vizWidth)
                            .attr("height",this.vizHeight);
        
        // margin_svg.append('line')
        //         .attr('x1', 150)
        //         .attr('y1', 0)
        //         .attr('x2', 150)
        //         .attr('y2', 100)
        //         .attr('stroke','black')

        let arr = [-75,-50,-25,25,50,75]
        margin_svg.selectAll('text')
                .data(arr)
                .join('text')
                    .attr('x',d => this.scaleX(d))
                    .attr('y', this.vizHeight-10)
                    .text(d => `+${Math.abs(d)}`)
                    .attr('class',d => (d<0)?'biden':'trump')
                    .classed('label',true)
        
        this.addGridlines(margin_svg, [0]);
    // if needed to change the xScale of transform then simply change this value
        // let translate_xValue = 50;
        // let translate_xValueL_75 = 10;
        // let translate_xValueL_50 = 50;
        // let translate_xValueL_25 = 90;

        // let translate_xValueR_25 = 180;
        // let translate_xValueR_50 = 220;
        // let translate_xValueR_75 = 260;

        // margin_svg.append("text")             
        //         .attr("transform",
        //         "translate("+translate_xValueL_75+",20)")
        //         // "translate("+(translate_xValue-40)+",50)")
        //             //   "translate(10,50)")
        //         // .style("text-anchor", "middle")
        //         .attr('style','label')
        //         // .attr('style','biden')
        //         .text("+75");

        // margin_svg.append("text")             
        //         .attr("transform",
        //         "translate("+translate_xValueL_50+",20)")
        //             //   "translate("+translate_xValue+",50)")
        //               //   "translate(50,50)")
        //         .attr('style','label')
        //         .text("+50");
       
        // margin_svg.append("text")             
        //         .attr("transform",
        //         "translate("+translate_xValueL_25+",20)")
        //             //   "translate("+(translate_xValue+40)+",50)")
        //               //   "translate(90,50)")
        //         .attr('style','label')
        //         .text("+25");

        // margin_svg.append("text")             
        //         .attr("transform",
        //         "translate("+translate_xValueR_25+",20)")
        //         // "translate("+(translate_xValue+40+90)+",50)")
        //             //   "translate(180,50)")
        //         .attr('style','label')
        //         .text("+25");

        // margin_svg.append("text")             
        //         .attr("transform",
        //         "translate("+translate_xValueR_50+",20)")
        //         // "translate("+(translate_xValue+40+130)+",50)")
        //             //   "translate(220,50)")
        //         .attr('style','label')
        //         .text("+50");

        // margin_svg.append("text")             
        //         .attr("transform",
        //         "translate("+translate_xValueR_75+",20)")
        //         // "translate("+(translate_xValue+40 + 170)+",50)")
        //             //   "translate(260,50)")
        //         .attr('style','label')
        //         .text("+75");

    }

    drawTable() {
        this.updateHeaders();
        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        rowSelection.on('click', (event, d) => 
            {
                if (d.isForecast)
                {
                    // console.log(this.tableData.indexOf(d)) // index can be used to know the current state
                    console.log("row clicked")
                    this.toggleRow(d, this.tableData.indexOf(d));
                }
            });

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')
            .attr('class', d => d.class);
         
        ////////////
        // PART 1 // 
        ////////////
        /**
         * with the forecastSelection you need to set the text based on the data value as long as the type is 'text'
         */
        // console.log("forecastSe:",forecastSelection);
        forecastSelection.filter(d => d.type === "text").text((d)=> d.value)

        let vizSelection = forecastSelection.filter(d => d.type === 'viz');

        let svgSelect = vizSelection.selectAll('svg')
            // .data(d => {
            //     // console.log("d:",d)
            //     return [d];
            // })
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', d => d.isForecast ? this.vizHeight : this.smallVizHeight);

        let grouperSelect = svgSelect.selectAll('g')
            .data(d => [d, d, d])
            .join('g');  // need to draw the gridlines dynamically
        // console.log(grouperSelect.filter((d,i) => i === 0))
        this.addGridlines(grouperSelect.filter((d,i) => i === 0), [-75, -50, -25, 0, 25, 50, 75]);
        this.addRectangles(grouperSelect.filter((d,i) => i === 1));
        this.addCircles(grouperSelect.filter((d,i) => i === 2));
    }

    rowToCellDataTransform(d) {
        let stateInfo = {
            type: 'text',
            class: d.isForecast ? 'state-name' : 'poll-name',
            value: d.isForecast ? d.state : d.name
        };

        let marginInfo = {
            type: 'viz',
            value: {
                marginLow: -d.p90_netpartymargin,
                margin: d.isForecast ? -(+d.mean_netpartymargin) : d.margin,
                marginHigh: -d.p10_netpartymargin,
            }
        };

        let winChance;
        if (d.isForecast)
        {
            const trumpWinChance = +d.winner_Rparty;
            const bidenWinChance = +d.winner_Dparty;

            const trumpWin = trumpWinChance > bidenWinChance;
            const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance);
            let winOddsMessage = `${Math.floor(winOddsValue)} of 100`
            if (winOddsValue > 99.5 && winOddsValue !== 100)
            {
                winOddsMessage = '> ' + winOddsMessage
            }
            winChance = {
                type: 'text',
                class: trumpWin ? 'trump' : 'biden',
                value: winOddsMessage
            }
        }
        else
        {
            winChance = {type: 'text', class: '', value: ''}
        }

        let dataList = [stateInfo, marginInfo, winChance];
        for (let point of dataList)
        {
            point.isForecast = d.isForecast;
        }
        return dataList;
    }

    updateHeaders() {
        ////////////
        // PART 7 // 
        ////////////
        /**
         * update the column headers based on the sort state
         */
        let headers = d3.select('#columnHeaders')
            .selectAll('th')
            // .data(this.tableData => console.log(this.tableData))
            .data(this.headerData)
            .attr('id', d => d.key)

        // worked
        headers.attr('class', function(d){
            // console.log(d)
            if(d.key === 'state'){
                if(d.sorted === true){
                    // console.log(d.key)
                    if(d.ascending === true){
                            d3.select(this).select('i')
                            .attr('class','fas fa-sort-up')
                    }
                    else{
                        d3.select(this).select('i')
                            .attr('class','fas fa-sort-down')
                    }
                    d3.select('#mean_netpartymargin')
                        .attr('class', 'sortable')
                        .select('i')
                            .attr('class','fas no-display')
                    // d3.select('#winner_Rparty')
                    //     .attr('class', 'sortable')
                    d3.select(this)
                        // .attr('class', 'sorting')
                        return 'sorting'
                }
            }
            else if(d.key === 'mean_netpartymargin'){
                // console.log(d.key)
                if(d.sorted === true){
                    // console.log(d.key)
                    if(d.ascending === true){
                            d3.select(this).select('i')
                            .attr('class','fas fa-sort-up')
                    }
                    else{
                        d3.select(this).select('i')
                            .attr('class','fas fa-sort-down')
                    }
                    d3.select('#state')
                        .attr('class', 'sortable')
                        .select('i')
                            .attr('class','fas no-display')
                    // d3.select('#winner_Rparty')
                    //     .attr('class', 'sortable')
                    d3.select(this)
                        // .attr('class', 'sorting')
                        return 'sorting'
                }
            }
            return 'sortable'
            
        })



        // headers.attr('class', function(d){
        //         console.log(d)
        //         if(d.key === 'state'){
        //             if(d.sorted === true){
        //                 console.log(d.key)
        //                 if(d.ascending === true){
        //                         d3.select(this).select('i')
        //                         .attr('class','fas fa-sort-up')
        //                 }
        //                 else{
        //                     d3.select(this).select('i')
        //                         .attr('class','fas fa-sort-down')
        //                 }
        //                 d3.select('#mean_netpartymargin')
        //                     .attr('class', 'sortable')
        //                     .select('i')
        //                         .attr('class','fas no-display')
        //                 // d3.select('#winner_Rparty')
        //                 //     .attr('class', 'sortable')
        //                 d3.select(this)
        //                     // .attr('class', 'sorting')
        //                     return 'sorting'
        //             }
        //         }
        //     })
     
    }

    addGridlines(containerSelect, ticks) {
        ////////////
        // PART 3 // 
        ////////////
        /**
         * add gridlines to the vizualization
        //  */
        // console.log("container:",containerSelect,"ticks:",ticks);

        containerSelect.selectAll('line')
                    .data(ticks)
                    .join('line')
                        .attr('x1',d => this.scaleX(d))
                        .attr('x2',d => this.scaleX(d))
                        .attr('y1',0)
                        .attr('y2',this.vizHeight)
                        .attr('stroke',d => (d === 0)?'black':'grey')
                        // .text(d => `+${Math.abs(d)}`)
                        // // .attr('class',d => (d<0)?'biden':'trump')
                        // .classed('label',true)



        // let svgSelect = d3.select('#predictionTableBody')
        //         .selectAll('tr')
        //         .selectAll('td')
        //         .selectAll('svg')
        // let grouperSelect = svgSelect.selectAll('g')
        //                             .data(ticks)
        //                             .append('line')
        //                             .attr('x1', 10)
        //                             .attr('y1', 0)
        //                             .attr('x2', 10)
        //                             .attr('y2', 30)
        //                             .attr('stroke','black')

        

    }

    addRectangles(containerSelect) {
        ////////////
        // PART 4 // 
        ////////////
        /**
         * add rectangles for the bar charts
         */
        // console.log(containerSelect)
        // console.log(this.scaleX(containerSelect._parents[0].__data__.value.marginLow))
        // console.log(this.scaleX(containerSelect._parents[0].__data__.value.marginHigh))
        // console.log(this.scaleX(containerSelect._parents[0].__data__.value.marginHigh) - this.scaleX(containerSelect._parents[0].__data__.value.marginLow))
        // console.log(containerSelect)

        // const margins = containerSelect._parents.map((row) => {
        //     // console.log(row.__data__.value.marginLow)
        //     return row.__data__.value
        // })
        // let scale  = this.scaleX; 
        let container = containerSelect.selectAll('rect') 
                    .data(this.marginLoHi)
                    .join('rect')
                        .attr('x',d => {
                            // console.log(d);
                            return this.scaleX(d.marginLow);
                        })
                        .attr('width',d => {
                            // console.log(d);
                            return this.scaleX(d.marginHigh)-this.scaleX(d.marginLow);
                        })
                        .attr('height',this.vizHeight-10)
                        .attr('class',d => (d.marginHigh<=0)?'biden':'trump')
                        .classed('margin-bar',true)
        
        // update();
        // console.log("d");

    }

    marginLoHi(d){ 
        let low_Biden;
        let high_Biden;
        let low_Trump;
        let high_Trump;
        if(d.value.marginHigh < 0){ 
            low_Biden = d.value.marginLow 
            high_Biden = d.value.marginHigh
            low_Trump = 0
            high_Trump = 0
        }
        else if(d.value.marginLow > 0){ 
            low_Biden = 0
            high_Biden = 0
            low_Trump = d.value.marginLow 
            high_Trump = d.value.marginHigh
        }
        else if (d.value.marginHigh > 0 && d.value.marginLow < 0){
            low_Biden = d.value.marginLow 
            high_Biden = 0
            low_Trump = 0
            high_Trump = d.value.marginHigh
        }
        else { 
            low_Biden = 0
            high_Biden = 0
            low_Trump = 0 
            high_Trump = 0
        } 
        let data = [{marginLow: low_Biden, marginHigh: high_Biden}, {marginLow: low_Trump, marginHigh: high_Trump}];
        // console.log(data);
        return data;
    }

    addCircles(containerSelect) {
        ////////////
        // PART 5 // 
        ////////////
        /**
         * add circles to the vizualizations
         */
         containerSelect.selectAll('circle') 
                        // .data(d => [d])
                        .data(this.cxOfCircle)
                        .join('circle')
                            // .attr('cx',this.scaleX(-2.20))
                            .attr('cx', d => (this.scaleX(d.cx)))
                            // // .attr('cy',10)
                            // .attr('cx', d => (this.scaleX(d.value.marginLow)+((this.scaleX(d.value.marginHigh)-this.scaleX(d.value.marginLow))/2)))
                            .attr('cy', 10)
                            .attr('r',d => d.r)
                            // // .style('fill', 'green');
                            // .attr('class',d => ( (this.scaleX(d.value.marginLow)+((this.scaleX(d.value.marginHigh)-this.scaleX(d.value.marginLow))/2) <= this.scaleX(0) )?'biden':'trump'))
                            .attr('class',d => (this.scaleX(d.cx) <= this.scaleX(0))?'biden':'trump')
      
    }

    cxOfCircle(d){
        // console.log("inside circle:",isNaN(d.value.marginLow))
        let cxValue;
        let rad;
        if(isNaN(d.value.marginLow)){
            cxValue = d.value.margin;
            rad = 3.5;
        }
        else{
            cxValue = d.value.marginLow+((d.value.marginHigh-d.value.marginLow)/2);
            rad = 5;
        }
        let data = [{cx: cxValue, r: rad}]
        return data;
    }

    attachSortHandlers() 
    {
        ////////////
        // PART 6 // 
        ////////////
        /**
         * Attach click handlers to all the th elements inside the columnHeaders row.
         * The handler should sort based on that column and alternate between ascending/descending.
         */
        // this.collapseAll();
        // console.log("tabledata inside sortHandler:",this.tableData);
        const that = this;
        let thSelection = d3.select('#columnHeaders')
                            .selectAll('th')
                            // .data(this.tableData => console.log(this.tableData))
                            .data(this.headerData)
                            .on('click', function(d){
                                // console.log(d)
                                // console.log(d.path[0].__data__.key)
                                console.log("Clicked")
                                that.collapseAll();
                                if (d.path[0].__data__.key === "state"){
                                    d.srcElement.nextElementSibling.__data__.sorted  = false;
                                    d.srcElement.nextElementSibling.__data__.ascending  = false;
                                    d.path[0].__data__.sorted = true;
                                    // console.log(d3.select('#mean_netpartymargin'))
                                    if (d.path[0].__data__.ascending === false) {
                                        // that.collapseAll();
                                        that.tableData = that.tableData.sort((a,b) => {
                                            return a['state'] < b['state'] ? -1 : 1;
                                        });
                                        d.path[0].__data__.ascending = true;
                                        // d.path[0].__data__.sorted = true;
                                        that.drawTable();
                                    }
                                    else if (d.path[0].__data__.ascending === true) {
                                        // that.collapseAll();
                                        that.tableData = that.tableData.sort((a,b) => a["state"] > b["state"] ? -1 : 1);
                                        d.path[0].__data__.ascending = false;
                                        // d.path[0].__data__.sorted = false;
                                        that.drawTable();
                                    }
                                }

                                else    if (d.path[0].__data__.key === "mean_netpartymargin"){
                                    // console.log('prev:', d.srcElement.previousElementSibling)
                                    d.srcElement.previousElementSibling.__data__.sorted  = false;
                                    d.srcElement.previousElementSibling.__data__.ascending  = false;
                                    d.path[0].__data__.sorted = true;
                                    if (d.path[0].__data__.ascending === false) {
                                        // that.collapseAll();
                                        that.tableData = that.tableData.sort((a,b) => {
                                            // console.log(a,a['mean_netpartymargin'], b['mean_netpartymargin'])
                                            return Math.abs(a['mean_netpartymargin']) < Math.abs(b['mean_netpartymargin']) ? -1 : 1;
                                        });
                                    d.path[0].__data__.ascending = true;
                                    // d.path[0].__data__.sorted = true;
                                    that.drawTable();
                                    }
                                    else if (d.path[0].__data__.ascending === true) {
                                        // that.collapseAll();
                                        that.tableData = that.tableData.sort((a,b) => Math.abs(a['mean_netpartymargin']) > Math.abs(b['mean_netpartymargin']) ? -1 : 1);
                                        d.path[0].__data__.ascending = false;
                                        // d.path[0].__data__.sorted = false;
                                        that.drawTable();
                                    }
                                }
                        
                            })
                               
    }

    toggleRow(rowData, index) {
        //////////// 
        // PART 8 // 
        ////////////
        /**
         * Update table data with the poll data and redraw the table.
         */
        // console.log(rowData, index)
        let indexOfObject;
        // var alerts = [ 
        //     {n : 1, app:'abc',message:'message'},
        //     {num : 2, app:'helloagain',message:'another message'} 
        // ]
        // // alerts[1].abc = [{abc:'abc'}];
        // // alerts.splice(1, 0, 'abc')  // splice to add right at that place
        // // alerts.splice(0,1)
        // indexOfObject =alerts.findIndex(obj => obj.app==='abc');
        // alerts.splice(indexOfObject,1)
        // console.log(alerts) 

        // if(this.tableData.isExpanded === true){
        //     console.log("expanded:",this.tableData.isExpanded)
        //     this.tableData.isExpanded = false;
        //     this.tableData = this.originalTableData;
        //     console.log(this.tableData)
        //     this.drawTable()
        //     // return;
        // }
        let pollRow;
        // console.log(this.tableData)
        for (let row of this.pollData){
            if (row[0] === rowData.state){
                pollRow = row[1]
                // console.log(this.tableData[index].isExpanded,row[1])
                if(this.tableData[index].isExpanded === false){
                    this.tableData[index].isExpanded = true;
                    console.log("clicked to expand", this.tableData[index].isExpanded)
                    for(let values of row[1]){
                        // console.log(values)
                        this.tableData.splice(index+1,0,values)
                    }
                }
                else{
                    console.log("clicked to collapse", this.tableData[index].isExpanded)
                    this.tableData[index].isExpanded = false;
                    console.log("clicked to collapse", this.tableData[index].isExpanded)
                    for(let values of row[1]){
                        this.tableData.splice(index+1,1)
                    }
                    // for(let values of row[1]){
                    //     console.log(values)
                    //     indexOfObject = this.tableData.findIndex(obj => obj.name === values.name)
                    //     console.log("index:",indexOfObject)
                    //     this.tableData.splice(indexOfObject,1)
                    // }
                    // console.log(row[1])
                    // this.tableData = this.tableData.filter(d => {
                    //     console.log("is expanded false:",d)
                    //     return d.isForecast;
                    // })
                }
                // this.tableData.splice(index+1,0,row[1])
            }
        }
        // this.tableData[0].pollRow = pollRow;
        // console.log("table with pull:",this.tableData)
        // this.tableData.push(pollRow[1])
        // this.tableData.splice(1,0,pollRow[1])
        // this.tableData.splice(1,0,pollRow[2])
        // console.log(this.tableData)

        this.drawTable()
    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast)
        for (let forecast of this.tableData)
        {
            forecast.isExpanded = false;
        }

        // this.tableData = this.originalTableData;
        // console.log("Original TableData:",this.originalTableData)
        console.log("Original TableData collapseAll:",this.tableData)
        // this.drawTable();
    }

}
