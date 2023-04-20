import { WebView } from 'react-native-webview';
import { StyleSheet, SafeAreaView , useWindowDimensions, Modal } from 'react-native';
import React, { useState,useRef,useEffect } from 'react';
import {INJECTED_JAVASCRIPT, HOME_INJECTED_JAVASCRIPT, DETAIL_CODE,jcode, EVENT_TYPE} from "./script"
import {getDirection, isHorizontalAction, swipeState} from "./util"
import {Video} from "./vidoe"
import * as ScreenOrientation from 'expo-screen-orientation';
import { DeviceMotion } from 'expo-sensors';

const homeUrl = "https://m.youtube.com/"

const detailState = {
    ...swipeState,
    startX: 0,
    startY: 0,
    left:0,
    swiping: false,
    close:false,
}

export default function App() {

    const videoUrl = "https://www.youtube.com/embed/1pBgMBBsv4k?autoplay=1&playsinline=1"
    const [fullscreen, setFullscreen] = useState(false)
    const [isHome, setIsHomme] = useState(true)
    const [mediaUrl, setMediaUrl] = useState("")
    //const [videoUrl, setvideoUrl] = useState("")
    const [detailTop, setDetailTop] = useState(0)

    const bounds = useRef({min:0, max:0})
    const {height, width} = useWindowDimensions();

    const home = StyleSheet.create({
        view:{
            flex:1,
            width:width,
            height:height,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:"#fff",
        }
    })

    const web = StyleSheet.create({
        home:{
            flex:1,
            width:width,
            height:height,
            display:"flex",
            zIndex:8000,
        },
        detail:{
            flex:1,
            width:width,
            height:height,
            display:"flex",
            zIndex:8000
        }
    })

    const onGrant = async (e) => {

        const canSwipe = e.nativeEvent.locationY >= bounds.current.min && e.nativeEvent.locationY <= bounds.current.max
        if(canSwipe){
            detailState.startX = e.nativeEvent.locationX
            detailState.startY = e.nativeEvent.locationY
            detailState.close = false
            detailState.swiping = true
        }
    }

    const onMove = (e) => {

        if(!detailState.swiping) return;

        const xDiff = detailState.startX - e.nativeEvent.locationX;
        const yDiff = detailState.startY - e.nativeEvent.locationY;

        if(!detailState.direction){
            detailState.direction = getDirection(xDiff - detailState.left, yDiff);
        }

        if(!isHorizontalAction(detailState)){
            if(e.nativeEvent.locationY < 10 || e.nativeEvent.locationY > height / 3){
                detailState.close = true
                return;
            }

            setDetailTop(-yDiff)

        }
    }

    const onRelease = () =>{

        if(!detailState.swiping) return;

        detailState.swiping = false;

        if(detailState.close){
            setIsHomme(true)
            setDetailTop(0)
        }else{
            setDetailTop(0)
        }

    }

    const onHomeMessage = async (e) => {
        console.log("-----onHomeMessage------")

        const data = JSON.parse(e.nativeEvent.data);

        if(data.event === EVENT_TYPE.videoClick){
            setMediaUrl(data.url)
            //await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
            setIsHomme(false)

            //setvideoUrl(`${homeUrl}embed/${url.substr(url.indexOf("?v=") + 3)}`)

        }
        console.log(data)
    }

    const onDetailMessage = (e) => {
        console.log("-----detail------")
        console.log(e.nativeEvent.data)

        const data = JSON.parse(e.nativeEvent.data)

        if(data.event === EVENT_TYPE.fullscreen){
            //const dofull = !fullscreen

            //setFullscreen(!fullscreen)
        }

        if(data.event === EVENT_TYPE.playerReady){
            bounds.current.min = data.top
            bounds.current.max = data.height + data.top
        }
    }

    const onOrientationChange = async (e) => {
        console.log("-----onOrientationChange------")
        console.log(e.nativeEvent.orientation)

        if(e.nativeEvent.orientation === "landscape"){

            //await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            //setFullscreen(true)
            //await ScreenOrientation.unlockAsync();
        }

    }

    const handleOrientationChange = (o) => {
        console.log("handleOrientationChange")
        console.log(o.orientationInfo.orientation);
    };
/*
    const handleOrientationChange2 = (o) => {
        console.log("handleOrientationChange2")
        console.log(o);
    };
*/
    useEffect( () => {
        /*
        (async() => {
            console.log("effect!!!!")
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        })()
*/
        //DeviceMotion.addListener(handleOrientationChange2)
        const subscription = ScreenOrientation.addOrientationChangeListener(handleOrientationChange);

        return () => {
            ScreenOrientation.removeOrientationChangeListeners(subscription);
            //DeviceMotion.removeAllListeners();
        };
    }, []);

    return (

        <SafeAreaView style={home.view}>

            <WebView
                source={{ uri: homeUrl }}
                style={web.home}
                injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT + HOME_INJECTED_JAVASCRIPT}
                mediaPlaybackRequiresUserAction={true}
                allowsInlineMediaPlayback={false}
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
                onOrientationChange={onOrientationChange}
                supportedOrientations={['portrait', 'landscape']}
            >
                <SafeAreaView
                    style={{flex: 1, top:detailTop, display:"flex", justifyContent:"center", alignItems:"center"}}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderTerminationRequest={() => false}
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

                <Video
                    width={width}
                    height={height}
                    videoUrl={videoUrl}
                    open={fullscreen}
                    //onOrientationChange={onOrientationChange}
                />

            </Modal>

        </SafeAreaView>
    );
}

