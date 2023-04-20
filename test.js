import { WebView } from 'react-native-webview';
import { StyleSheet, SafeAreaView , useWindowDimensions, Modal,View } from 'react-native';
import React, { useState,useRef } from 'react';
import {INJECTED_JAVASCRIPT, HOME_INJECTED_JAVASCRIPT, DETAIL_CODE,jcode} from "./script"


const homeUrl = "https://m.youtube.com/"

const DIRECTION = {
    right:"right",
    left:"left",
    up: "up",
    down:"down",
}

const swipeState = {
    startX: 0,
    startY: 0,
    startTime:0,
    moveY: 0,
    moveX:0,
    isMoved:false,
    swiping: false,
    close:false,
    direction: "",
    left:0,
    degree:0,
}

const getDirection = (xDiff,yDiff) => {

    if( Math.abs( xDiff ) > Math.abs( yDiff ) ){

        if( xDiff > 0 ){
            return DIRECTION.left;
        }

        return DIRECTION.right;
    }

    if( yDiff > 0 ){
        return DIRECTION.up
    }

    return DIRECTION.down;

}

const isHorizontalAction = () => {

    if(swipeState.direction === DIRECTION.right || swipeState.direction === DIRECTION.left){
        return true;
    }

    return false;
}

export default function App() {

    const bounds = {
        min:0,
        max:0
    }
    const initialLayout = {
        x:0,
        y:0
    }

    const videoUrl = "https://www.youtube.com/embed/1pBgMBBsv4k"
    const [fullscreen, setFullscreen] = useState(false)
    const [isHome, setIsHomme] = useState(true)
    const [mediaUrl, setMediaUrl] = useState("")
    const [top, settop] = useState(0)
    const [layout, setLayout] = useState(initialLayout)
    const webViewRef = useRef(null)
    const {height, width} = useWindowDimensions();
    const [deg, setDeg] = useState("rotate(0deg)")
    const origWidth = width;
    const origHeight = height;

    const home = StyleSheet.create({
        view:{
            width:width,
            height:height,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:"#fff",
            //transform:"rotate(90deg)",
        },
        abc:{
            width:height,
            height:width,
            transform:"rotate(90deg)",
        }
    })

    const web = StyleSheet.create({
        visible:{
            flex:1,
            width:width,
            height:height,
            display:"flex",

        },
        detail:{
            flex:1,
            width:width,
            height:height
        },
        fullscreen:{
            flex:1,
            width:height,
            height:"100%",
            transform:"rotate(90deg)",
        }

    })

    const onGrant = (e) => {

        if(e.nativeEvent.locationY >= bounds.min && e.nativeEvent.locationY <= bounds.max){
            swipeState.startX = e.nativeEvent.locationX
            swipeState.startY = e.nativeEvent.locationY
            swipeState.close = false
            swipeState.swiping = true
        }
    }

    const onMove = (e) => {

        if(!swipeState.swiping) return;

        const xDiff = swipeState.startX - e.nativeEvent.locationX;
        const yDiff = swipeState.startY - e.nativeEvent.locationY;

        if(!swipeState.direction){
            swipeState.direction = getDirection(xDiff - swipeState.left, yDiff);
        }

        if(!isHorizontalAction()){
            if(e.nativeEvent.locationY < 10 || e.nativeEvent.locationY > height / 3){
                swipeState.close = true
                return;
            }
            settop(-yDiff)
        }
    }

    const onRelease = (e) =>{

        if(!swipeState.swiping) return;

        swipeState.swiping = false;
        tapStart = false;

        if(swipeState.close){
            setIsHomme(true)
            settop(0)
        }else{
            settop(0)
        }
    }

    const onHomeLayout = (e) => {
        initialLayout.height = e.nativeEvent.layout.height
        initialLayout.width = e.nativeEvent.layout.width
        initialLayout.x = e.nativeEvent.layout.x
        initialLayout.y = e.nativeEvent.layout.y
        console.log(initialLayout)
        console.log(width)
        console.log(height)

    }

    const onHomeMessage = (e) => {
        console.log(e.nativeEvent.data)
        setIsHomme(false)
        setMediaUrl(e.nativeEvent.data)
    }

    const onDetailMessage = (e) => {
        console.log(e.nativeEvent.data)
        const data = JSON.parse(e.nativeEvent.data)
        if(data.id == 2){
            setFullscreen(!fullscreen)
        }else{
            bounds.min = data.top
            bounds.max = data.height + data.top
        }
    }

    const onOrientationChange = (e) => {
        console.log(e.nativeEvent.data)
        //landscape
    }

    return (
        <SafeAreaView style={home.view} onLayout={onHomeLayout}>

            <WebView
                ref={webViewRef}
                source={{ uri: homeUrl }}
                //style={web.visible}
                style={web.visible}
                injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT + HOME_INJECTED_JAVASCRIPT}
                mediaPlaybackRequiresUserAction={true}
                allowsInlineMediaPlayback={true}
                contentInsetAdjustmentBehavior={"automatic"}
                allowsBackForwardNavigationGestures={true}
                pullToRefreshEnabled={false}
                originWhitelist={['*']}
                onMessage={onHomeMessage}

            />

            <Modal
                animationType="slide"
                transparent={false}
                visible={!isHome}
                statusBarTranslucent={true}
                onOrientationChange={onOrientationChange}
                supportedOrientations={['portrait', 'landscape']}
            >
                <SafeAreaView
                    style={{flex: 1, top:top, display:"flex", justifyContent:"center", alignItems:"flex-end", flexDirection:"column"}}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderGrant={ (e) => onGrant(e)}
                    onResponderMove={(e) => onMove(e)}
                    onResponderRelease={(e) => onRelease(e)}
                >
                    <WebView
                        source={{ uri: mediaUrl}}
                        style={web.detail}
                        injectedJavaScript={jcode}
                        injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT + DETAIL_CODE}
                        mediaPlaybackRequiresUserAction={true}
                        allowsInlineMediaPlayback={true}
                        contentInsetAdjustmentBehavior={"automatic"}
                        allowsBackForwardNavigationGestures={true}
                        pullToRefreshEnabled={false}
                        originWhitelist={['*']}
                        onMessage={onDetailMessage}
                    />
                </SafeAreaView>
                            <Modal
                            animationType="slide"
                            transparent={false}
                            visible={fullscreen}
                            statusBarTranslucent={true}
                            supportedOrientations={['landscape']}
                        >
                            <View
                                style={{flex: 1}}
                            >
                                <WebView
                                    source={{ uri: videoUrl}}
                                    style={web.detail}
                                    injectedJavaScript={jcode}
                                    injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT + DETAIL_CODE}
                                    mediaPlaybackRequiresUserAction={true}
                                    allowsInlineMediaPlayback={true}
                                    contentInsetAdjustmentBehavior={"never"}
                                    allowsBackForwardNavigationGestures={false}
                                    pullToRefreshEnabled={false}
                                    originWhitelist={['*']}
                                    onMessage={onDetailMessage}
                                />
                            </View>
                        </Modal>
            </Modal>

        </SafeAreaView>
    );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
