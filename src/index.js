import isFunc from './is-function';
import {decorators, annotations as annotes} from './bdd-decorators';
import getInheritedProps from './get-inherited-props';

export {
    runTest,
    decorators as bdd
};

function runTest(suite) {
    let proto = Object.getPrototypeOf(suite);
    let suiteName = proto.constructor.suiteName;
    let annotations = getAnnotatedValues(proto);

    let {beforeFunc, beforeEachFunc, afterFunc, testName, skippedName} = annotations;

    describe(suiteName, () => {
        beforeFunc.forEach(beforeHook => before(beforeHook.bind(suite)));
        beforeEachFunc.forEach(beforeEachHook => beforeEach(beforeEachHook.bind(suite)));
        afterFunc.forEach(afterHook => after(afterHook.bind(suite)));
        testName.forEach(test => it(test.testName, test.bind(suite)));
        skippedName.forEach(skipped => it.skip(skipped.skippedName, skipped.bind(suite)))
    });
}

function getAnnotatedValues(suite) {
    let props = getInheritedProps(suite);
    let suiteData = getEmptyAnnotations();

    props.forEach(prop => {
        let method = suite[prop];
        if (!isFunc(method)) return;

        let methodProps = Object.keys(method);
        methodProps.forEach(prop => {
            let hasAnnote = annotations.includes(prop);
            if (hasAnnote) suiteData[prop].push(method);
        });
    });

    return suiteData;
}

const annotations = Object.keys(annotes).map(key => annotes[key]);

function getEmptyAnnotations() {
    return annotations.reduce((collection, annotationType) => {
        collection[annotationType] = [];
        return collection;
    }, {});
}
