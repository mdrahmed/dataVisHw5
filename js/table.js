/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object 
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData;
        this.tableData = [...forecastData];
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
        // console.log(this.scaleX(-0.4384384))
        // console.log(this.scaleX(containerSelect._parents[0].__data__.value.marginLow))
        // console.log(this.scaleX(containerSelect._parents[0].__data__.value.marginHigh))
        // console.log(this.scaleX(containerSelect._parents[0].__data__.value.marginHigh) - this.scaleX(containerSelect._parents[0].__data__.value.marginLow))
        // console.log(containerSelect._parents)

        // const margins = containerSelect._parents.map((row) => {
        //     // console.log(row.__data__.value.marginLow)
        //     return row.__data__.value
        // })
        // console.log("only margins:", margins)
        // let arr = [23,34,10]

        console.log("scaleX 0:",this.scaleX(0))
        // let scale = this
    //worked
        // containerSelect.selectAll('rect')
        //                 .data(d => [d])
        //                 .join('rect')
        //                         .attr('x',d => {
        //                             return this.scaleX(d.value.marginLow)
        //                         })
        //                         .attr('width',d => {
        //                             console.log(d)
        //                             // return this.scaleX(d.__data__.value.marginHigh)-this.scaleX(d.__data__.value.marginLow)
        //                             return this.scaleX(d.value.marginHigh)-this.scaleX(d.value.marginLow)

        //                         })
        //                         .attr('height',this.vizHeight-10)
        //                         .attr('class','biden')

        
        // let scale  = this.scaleX; 
        let container = containerSelect.selectAll('rect') 
                    .data(this.marginLoHi)
                    .join('rect')
                        .attr('x',d => {
                            console.log(d);
                            return this.scaleX(d.marginLow);
                        })
                        .attr('width',d => {
                            console.log(d);
                            return this.scaleX(d.marginHigh)-this.scaleX(d.marginLow);
                        })
                        .attr('height',this.vizHeight-10)
                        .attr('class',d => (d.marginHigh<=0)?'biden':'trump')
                        .classed('margin-bar',true)
        
        // update();
        // console.log("d")

    }

    marginLoHi(d){ 
        // console.log(d)
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
        let biden = {marginLow: low_Biden,
        marginHigh: high_Biden}
        let trump = {marginLow: low_Trump,
            marginHigh: high_Trump}
        let data = [biden, trump];
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

        
    }

  


    toggleRow(rowData, index) {
        ////////////
        // PART 8 // 
        ////////////
        /**
         * Update table data with the poll data and redraw the table.
         */
     
    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast)
    }

}
