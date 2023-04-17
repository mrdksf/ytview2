export const INJECTED_JAVASCRIPT = `(function() {
    Object.defineProperties(window, {

        _ytInitialPlayerResponse: {
            value: undefined,
            writable: true
        },

        ytInitialPlayerResponse: {
            get: function(){
                return this._ytInitialPlayerResponse;
            },
            set: function(val) {
                if(val.adPlacements){
                    val.adPlacements = undefined
                }
                this._ytInitialPlayerResponse = val;
            }
        },
    });


    const adPaths = [
        "[].playerResponse.adPlacements",
        "[].playerResponse.playerAds",
        "playerResponse.adPlacements",
        "playerResponse.playerAds",
        "adPlacements",
        "playerAds"
    ]

    const deleteAds = (target, paths) => {

        if(paths[0] === "[]" && Array.isArray(target)){
            target.forEach(data => deleteAds(data))
        }

        const prop = paths.shift()

        if(!target.hasOwnProperty(prop)) return

        if(paths.length > 0){
            resolvePath(target[prop], paths)
        }else{
            delete target[prop];
        }

    }

    const clean = (data) => {
        adPaths.forEach(path => {
            deleteAds(data, path.split(","))
        })
            return data;
    };

    JSON.parse = new Proxy(JSON.parse, {
        apply: function() {
            return clean(Reflect.apply(...arguments));
        },
    });

    Response.prototype.json = new Proxy(Response.prototype.json, {
        apply: function() {
            return Reflect.apply(...arguments).then(data => clean(data));
        },
    });

})();
`;

export const HOME_INJECTED_JAVASCRIPT = `(function() {
    window.addEventListener("click", e => {

        const path = e.composedPath();

        if(!path) return;

        const ytms = path.filter(node => node.tagName === "YTM-RICH-ITEM-RENDERER")

        if(ytms.length > 0){
            console.log("here")
            e.preventDefault()
            e.stopImmediatePropagation();
            e.stopPropagation();
            const anchors = path.filter(node => node.tagName === "A")
            if(anchors.length > 0){
                window.ReactNativeWebView.postMessage(anchors[0].href)
            }
        }
    })

})();`;

export const jcode = `(function() {

    const target = document.querySelectorAll(".player-container")

    if(target.length){
        const rect = target[0]//.getBoundingClientRect()
        const data = {
            id:1,
            height:rect.offsetHeight,
            top:rect.offsetTop
        }
        window.ReactNativeWebView.postMessage(JSON.stringify(data))
    }
})();`;

export const DETAIL_CODE = `(function() {

    const isFullScreen = () => {
        return document.body.getAttribute("faux-fullscreen")
    }

    const toggleFullScreen = () => {

    }

    window.addEventListener("touchend", e => {

        const path = e.composedPath();

        if(!path) return;

        const ytms = path.filter(node => node.classList && node.classList.contains("fullscreen-icon"))

        if(ytms.length > 0){
            console.log("fullscreen")
            e.preventDefault()
            e.stopImmediatePropagation();
            e.stopPropagation();
            window.ReactNativeWebView.postMessage(JSON.stringify({id:2,isFullScreen:isFullScreen()}))
            toggleFullScreen()
        }

    })

})();`;