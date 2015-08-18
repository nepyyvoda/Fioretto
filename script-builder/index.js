/**
 * Created by anton.nepyyvoda on 15.06.2015.
 */

function scriptBuild(data){
    if(data instanceof Array){
        console.log("NOT REALIZED :(");
    }else{
        return scriptBuildFromOneObject(data);
    }
}

function scriptBuildFromOneObject(data){
    var superObject = {};
    var script = [];
    var job = [];

    if(data.eventsChain !== undefined){
        for(var i = 0; i < data.eventsChain.length; i++){
            var obj = {};
            var action = {};
            obj.xpath = data.eventsChain[i].element;
            action.method = data.eventsChain[i].action;

            if(data.eventsChain[i].data !== 'undefined')
                action.data = data.eventsChain[i].data;

            if(data.eventsChain[i].specSymbol !== 'undefined')
                action.data = data.eventsChain[i].specSymbol;

            if(data.eventsChain[i].position !== 'undefined')
                obj.position = data.eventsChain[i].position;
            obj.action = action;

            job.push(obj);
        }

        var itemScript = {};
        itemScript.url = data.url;
        itemScript.job = job;

        script.push(itemScript);

        superObject.script = script;
        superObject.resolution = JSON.parse(data.resolution);

        console.log("MSCRIPT : ", JSON.stringify(superObject));

        return JSON.stringify(superObject);
    }else{
        return {error: "Not Have Event!"};
    }
}

module.exports.scriptBuild = scriptBuild;