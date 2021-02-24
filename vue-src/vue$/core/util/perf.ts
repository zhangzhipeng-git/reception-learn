import { inBrowser } from './env'

/**
 * window.performance.mark('kaishi');
 * var a = 100;
 * while(a--);;
 * window.performance.mark('jieshu');
 * window.performance.measure('name','kaishi','jieshu');
 * console.log(performance.getEntriesByType("measure"));
 * 
 *  duration: 0.10000000474974513 // 间隔时间
 * 
 *  entryType: "measure" // 类型为衡量
 * 
 *  name: "name" // 调用measure()方法时自定义的名字
 * 
 *  startTime: 11888.600000005681 // 开始时间
 * 
 *  __proto__: PerformanceMeasure // 原型
 */


/**
 * 性能标记
 * @param {string} tag 标记名称（开始标记名称或结束标记名称）
 */
export let mark
/**
 * 性能评估
 * @param {string} name 名称
 * @param {string} startTag 开始测量点——开始标记名称
 * @param {string} endTag 结束测量点——结束标记名称
 */
export let measure

// 性能检测
if (process.env.NODE_ENV !== 'production') {
    const perf = inBrowser && window.performance
    /* istanbul ignore if */
    if (
        perf &&
        perf.mark &&
        perf.measure &&
        perf.clearMarks &&
        perf.clearMeasures
    ) {
        mark = tag => perf.mark(tag)
        measure = (name, startTag, endTag) => {
            perf.measure(name, startTag, endTag)
            perf.clearMarks(startTag)
            perf.clearMarks(endTag)
            // perf.clearMeasures(name)
        }
    }
}

/**
 * // Run some nested timeouts, and create a PerformanceMark for each.
    performance.mark(markerNameA);
    setTimeout(function() {
    performance.mark(markerNameB);
    setTimeout(function() {

        // Create a variety of measurements.
        performance.measure("measure a to b", markerNameA, markerNameB);
        performance.measure("measure a to now", markerNameA);
        performance.measure("measure from navigation start to b", undefined, markerNameB);
        performance.measure("measure from the start of navigation to now");

        // Pull out all of the measurements.
        console.log(performance.getEntriesByType("measure"));

        // Finally, clean up the entries.
        performance.clearMarks();
        performance.clearMeasures();
    }, 1000);
    }, 1000);
 */
