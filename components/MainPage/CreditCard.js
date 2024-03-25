import React, { useContext, useState, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Clipboard
} from 'react-native';
import BackImage from '../../assets/images/doodle.png';
import ThreeDot from '../../assets/images/three-dot.png';
import ThreeDotDark from '../../assets/images/three-dot-dark.png';
import AddressCopy from '../../assets/images/address_copy.png';
import BuyIcon from '../../assets/images/buy_icon.png';
import BuyIconDark from '../../assets/images/buy_icon_dark.png';
import SellIcon from '../../assets/images/sell_icon.png';
import SellIconDark from '../../assets/images/sell_icon_dark.png';
import SwapIcon from '../../assets/images/swap_icon.png';
import SwapIconDark from '../../assets/images/swap_icon_dark.png';
import BridgingIcon from '../../assets/images/bridging_icon.png';
import BridgingDark from '../../assets/images/bridging_icon_dark.png';
import StakingIcon from '../../assets/images/bottom-center.png';
import StakingDark from '../../assets/images/bottom-center-dark.png';
import { ThemeContext } from '../../context/ThemeContext';
import { DoodleContext } from '../../context/DoodleContext';
import { getSolBalance, getEVMBalance , getBTCBalance , getdogeBalance, gettronBalance} from '../../utils/function';
import { useAuth } from '../../context/AuthContext';

import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
setUpdateIntervalForType(SensorTypes.accelerometer, 50); 


const CreditCard = ({ getOpenCustomizer, customizerVal, navigation, isOpen, activeAccount, address }) => {
  const { theme } = useContext(ThemeContext);
  const { doodle, doodleBG } = useContext(DoodleContext);
  const { selectedNetwork, Networks , selectedAccount } = useAuth()
  const [ballance, setBalance] = useState(0);
  const [activeNet, setActiveNet] = useState()
  const [hideFullAddress, setHideFullAddress] = useState(true);


  const getNetworkactive = async () => {
    let data = await JSON.parse(selectedNetwork)
    setActiveNet(data)
  }

  useEffect(() => {
    getNetworkactive()
  }, [selectedNetwork, Networks])



  const handleCopyText = () => {
    Clipboard.setString(address.replace(/^"|"$/g, ''));
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Copied',
      textBody: 'Copy to Clipboard',
    })

  };

  const getbls = async () => {
    if (activeNet?.type === "evm") {
      let data = await getEVMBalance(address.replace(/^"|"$/g, ''), activeNet?.nodeURL)
      setBalance(data?.balance)
    }else if(activeNet?.type === "btc"){
      // console.log(address)
      let data = await getBTCBalance(address.replace(/^"|"$/g, ''))
      setBalance(data?.balance)
    }else if(activeNet?.type === "tron"){
      console.log(address)
      let data = await gettronBalance(address.replace(/^"|"$/g, ''))
      setBalance(data?.balance)
    }else if(activeNet?.type === "doge"){
      // console.log(address)
      let data = await getdogeBalance(address.replace(/^"|"$/g, ''))
      setBalance(data?.balance)
    }else {
      let data = await getSolBalance(address.replace(/^"|"$/g, ''))
      setBalance(data?.balance)
    }
  }
  useEffect(() => {
    getbls()
    const intervalId = setInterval(getbls, 10000);
    return () => clearInterval(intervalId);
  }, [Networks, address, activeAccount , selectedNetwork ,activeNet])
    
  useEffect(()=>{
      getbls()
    },[selectedAccount])
  
    useEffect(() => {
      // Subscribe to accelerometer data
      const subscription = accelerometer.subscribe(({x, y, z}) => {
        // Calculate the magnitude of acceleration
        const acceleration = Math.sqrt(x * x + y * y + z * z);
  
        // Threshold for detecting shake (adjust as needed)
        const shakeThreshold = 25;
  
        // Check if the magnitude of acceleration exceeds the threshold
        if (acceleration > shakeThreshold) {
          // Shake gesture detected, handle accordingly
          console.log('Shake detected!', hideFullAddress);
          setHideFullAddress(prev => !prev);
        }
      });
  
      // Cleanup: unsubscribe from accelerometer data when component unmounts
      return () => {
        subscription.unsubscribe();
      };
    }, []);

    return (
    <ImageBackground
      source={doodle}
      resizeMode="cover"
      style={[styles.cardWrapper, { backgroundColor: doodleBG }]}>
      <View style={styles.cardHeader}>
        <View>

          <Text style={[styles.cardAmount, {color: theme.cardtext}]}>
            {address?.length === 23 ? (
              'Account Not Available'
            ) : (
              <>
                &nbsp;
                {Number(ballance).toFixed(5)
                  ? hideFullAddress
                    ? Number(ballance)
                        .toFixed(5)
                        .replace(/[^\]](?![^\[]*\])/g, '*')
                    : Number(ballance).toFixed(5)
                  : '0.00'}{' '}
                {activeNet?.symbol}
              </>
            )}
          </Text>
        </View>
        <View>
          <TouchableOpacity
            style={styles.threeDotSpace}
            onPress={() => {
              !isOpen ? getOpenCustomizer(!customizerVal) : null;
            }}>
            <Image source={theme.type == 'dark' ? ThreeDot : ThreeDotDark} />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={[
          styles.walletAddressWrapper,
          { backgroundColor: theme.rightArrowBG },
        ]}>
        <View>

          <Text style={[styles.walletAddressText, { color: theme.text }]}>
            <>
              Address: {address ? `${address?.replace(/^"|"$/g, '')?.substring(0,10)+"....."+address.replace(/^"|"$/g, '')?.substring(address?.length - 10,address?.length) }` : 'Loading...'}
            </>
            {/* address?.replace(/^"|"$/g, '')?.substring(0,10)+"....."+address.replace(/^"|"$/g, '')?.substring(address?.length - 10,address?.length) */}
          </Text>

        </View>
        <View>
          <TouchableOpacity
            onPress={() => handleCopyText()}
            style={[
              styles.addressCopyWrapper,
              { backgroundColor: theme.emphasis },
            ]}>
            <Image source={AddressCopy} />
          </TouchableOpacity>
        </View>
      </View>
      {/*  */}
      { address?.length === 23 ? "" :
      <View style={styles.cardBtnFlex}>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate('Buy',{ account: selectedAccount, amount:Number(ballance) , network : activeNet})}>
            <View
              style={[
                styles.cardBtnsWrapper,
                { backgroundColor: theme.rightArrowBG },
              ]}>
              <Image source={theme.type == 'dark' ? BuyIcon : BuyIconDark} />
            </View>
          </TouchableOpacity>
          <View>
          <Text style={[styles.btnsLabel, {color: theme.cardtext}]}>
            Send</Text>
          </View>
        </View>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate('Sell',{ account: address, network : activeNet})}>
            <View
              style={[
                styles.cardBtnsWrapper,
                { backgroundColor: theme.rightArrowBG },
              ]}>
              <Image source={theme.type == 'dark' ? SellIcon : SellIconDark} />
            </View>
          </TouchableOpacity>
          <View>
          <Text style={[styles.btnsLabel, {color: theme.cardtext}]}>
            Receive</Text>
          </View>
        </View>
        {activeNet?.type === "btc" || activeNet?.type === "tron" || activeNet?.type === "doge" ? 
        <>
          <View>
          <TouchableOpacity disabled onPress={() => {activeNet?.type === "evm" ? navigation.navigate('swapevm'):navigation.navigate('Swap')}}>
            <View
              style={[
                styles.cardBtnsWrapper,
                { backgroundColor: theme.rightArrowBG },
              ]}>
              <Image source={theme.type == 'dark' ? SwapIcon : SwapIconDark} />
            </View>
          </TouchableOpacity>
          <View>
          <Text style={[styles.btnsLabel, {color: theme.cardtext}]}>
            Swap</Text>
          </View>
        </View>
        <View>
          <TouchableOpacity disabled onPress={() => navigation.navigate('Bridging')}>
            <View
              style={[
                styles.cardBtnsWrapper,
                { backgroundColor: theme.rightArrowBG },
              ]}>
              <Image
                source={theme.type == 'dark' ? BridgingIcon : BridgingDark}
              />
            </View>
          </TouchableOpacity>
          <View>
          <Text style={[styles.btnsLabel, {color: theme.cardtext}]}>
              Bridging
            </Text>
          </View>
        </View>
    
        </>
        :
      <>
        <View>
          <TouchableOpacity onPress={() => {activeNet?.type === "evm" ? navigation.navigate('swapevm'):navigation.navigate('Swap')}}>
            <View
              style={[
                styles.cardBtnsWrapper,
                { backgroundColor: theme.rightArrowBG },
              ]}>
              <Image source={theme.type == 'dark' ? SwapIcon : SwapIconDark} />
            </View>
          </TouchableOpacity>
          <View>
          <Text style={[styles.btnsLabel, {color: theme.cardtext}]}>
            Swap</Text>
          </View>
        </View>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate('Bridging')}>
            <View
              style={[
                styles.cardBtnsWrapper,
                { backgroundColor: theme.rightArrowBG },
              ]}>
              <Image
                source={theme.type == 'dark' ? BridgingIcon : BridgingDark}
              />
            </View>
          </TouchableOpacity>
          <View>
          <Text style={[styles.btnsLabel, {color: theme.cardtext}]}>
              Bridging
            </Text>
          </View>
        </View>
       
      </>
        }
        {activeNet?.type === "btc" || activeNet?.type === "tron" || activeNet?.type === "doge" || activeNet?.type === "evm" ? 
        <>
        <View>
          <TouchableOpacity disabled onPress={() => navigation.navigate('Staking')}>
            <View
              style={[
                styles.cardBtnsWrapper,
                { backgroundColor: theme.rightArrowBG },
              ]}>
              <Image
                source={theme.type == 'dark' ? StakingIcon : StakingDark   }
              />
            </View>
          </TouchableOpacity>
          <View>
          <Text style={[styles.btnsLabel, {color: theme.cardtext}]}>
              Staking
            </Text>
          </View>
        </View>
        </>
        :
      <>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate('Staking')}>
            <View
              style={[
                styles.cardBtnsWrapper,
                { backgroundColor: theme.rightArrowBG },
              ]}>
              <Image
                source={theme.type == 'dark' ? StakingIcon : StakingDark   }
              />
            </View>
          </TouchableOpacity>
          <View>
          <Text style={[styles.btnsLabel, {color: theme.cardtext}]}>
              Staking
            </Text>
          </View>
        </View>
      </>
        }
      </View>
      }
    </ImageBackground>
  );
};

export default CreditCard;

const styles = StyleSheet.create({
  cardWrapper: {
    padding: 20,
    // backgroundColor: "#104a5c",
    borderRadius: 15,
    marginTop: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAmount: {
    // color: '#FFF',
    fontFamily: 'SF Pro Text',
    fontSize: 30.586,
    fontStyle: 'normal',
    fontWeight: '400',
  },
  threeDotSpace: {
    padding: 10,
  },
  walletAddressWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 100,
    // backgroundColor: "#4E3B51",
    padding: 8,
    marginTop: 15,
  },
  walletAddressText: {
    // color: "white"
  },
  addressCopyWrapper: {
    padding: 5.449,
    borderRadius: 100,
    // backgroundColor: "#F43459"
  },
  cardBtnFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 15,
  },
  cardBtnsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    // paddingVertical: 9.558,
    // paddingHorizontal: 30.586,
    borderRadius: 100,
    // backgroundColor: "#4E3B51",
  },

  btnsLabel: {
    marginTop: 8,
    textAlign: 'center',
    // color: "#FFF",
    fontSize: 13.381,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 17.205,
    textTransform: 'capitalize',
  },
});
