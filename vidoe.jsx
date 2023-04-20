import { WebView } from 'react-native-webview';
import { StyleSheet, Modal,View } from 'react-native';
import React, { useState, useEffect } from 'react';
import {getDirection, isHorizontalAction, swipeState} from "./util"
import {INJECTED_JAVASCRIPT, FULL_CODE} from "./script"
import * as ScreenOrientation from 'expo-screen-orientation';

export const Video = props => {

    const videoState = {
        ...swipeState,
        startX: 0,
        startY: 0,
        left:0,
        swiping: false,
        close:false,
    }

    const [open, setOpen] = useState(props.open)
    const [videoTop, setVideoTop] = useState(0)

    const web = StyleSheet.create({
        normal:{
            flex:1,
            width:props.width,
            height:props.height,
            display:"flex",
            zIndex:8000
        },
        visible:{

            zIndex:9999
        }
    })

    const onGrant = (e) => {

        videoState.startX = e.nativeEvent.locationX
        videoState.startY = e.nativeEvent.locationY
        videoState.close = false
        videoState.swiping = true

    }

    const onMove = (e) => {

        if(!videoState.swiping) return;

        const xDiff = videoState.startX - e.nativeEvent.locationX;
        const yDiff = videoState.startY - e.nativeEvent.locationY;

        if(!videoState.direction){
            videoState.direction = getDirection(xDiff - videoState.left, yDiff);
        }

        if(!isHorizontalAction(videoState)){
            if(e.nativeEvent.locationY < 10 || e.nativeEvent.locationY > props.width / 3){
                videoState.close = true
                return;
            }

            setVideoTop(-yDiff)

        }
    }

    const onRelease = () =>{

        if(!videoState.swiping) return;

        videoState.swiping = false;

        if(videoState.close){
            setOpen(false)
            setVideoTop(0)
        }else{
            setVideoTop(0)
        }

    }

    const onDetailMessage = (e) => {
        console.log("----- video detail ------")
        console.log(e.nativeEvent.data)
        const data = JSON.parse(e.nativeEvent.data)
        if(data.id == 2){
            setOpen(false)
        }
    }

    const onOrientationChange = async (e) => {
        console.log("----- full orient ------")
        if(open && e.nativeEvent.orientation !== "landscape"){
            //setOpen(false)
            console.log(e.nativeEvent.orientation)
        }

    }
    const handleOrientationChange = (o) => {
        console.log("--- full ---- handleOrientationChange")
        console.log(o.orientationInfo.orientation);
    };
    useEffect(() => {

        setOpen(props.open)
        const subscription = ScreenOrientation.addOrientationChangeListener(handleOrientationChange);

        return () => {
            ScreenOrientation.removeOrientationChangeListeners(subscription);
        };

    }, [props.open]);

    return (
        <Modal
            animationType="fade"
            transparent={false}
            visible={open}
            supportedOrientations={["landscape","portrait"]}
            onOrientationChange={onOrientationChange}
        >
        <View
            style={{flex: 1, top:videoTop}}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={ (e) => onGrant(e)}
            onResponderMove={(e) => onMove(e)}
            onResponderRelease={(e) => onRelease(e)}
        >
            <WebView
                source={{ uri: props.videoUrl}}
                style={web.full}
                injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT + FULL_CODE}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
                contentInsetAdjustmentBehavior={"never"}
                allowsBackForwardNavigationGestures={false}
                pullToRefreshEnabled={false}
                originWhitelist={['*']}
                onMessage={onDetailMessage}
            />
        </View>
    </Modal>
    )
}