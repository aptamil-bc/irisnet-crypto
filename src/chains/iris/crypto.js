'use strict';
const Crypto = require("../../crypto");
const Old = require('old');
const IrisKeypair = require('./keypair');
const Codec = require("../../util/codec");
const Utils = require("../../util/utils");
const Config = require('../../../config');
const Bip39 = require('bip39');

let accAddress = Config.iris.bech32.accAddr;
class IrisCrypto extends Crypto {
    /**
     *
     * @param language
     * @returns {*}
     */
    create(language, mnemonicLength = 24, accAddr = Config.iris.bech32.accAddr) {
        let keyPair = IrisKeypair.create(switchToWordList(language), mnemonicLength);
        if (accAddr && accAddr.length) {
            accAddress = accAddr;
        }
        if (keyPair) {
            return encode({
                address: keyPair.address,
                phrase: keyPair.secret,
                privateKey: keyPair.privateKey,
                publicKey: keyPair.publicKey,
            });
        }
        return keyPair;
    }

    /**
     *
     * @param language
     * @param mnemonicLength 12/15/18/21/24
     * @returns mnemonics
     */
    generateMnemonic(language, mnemonicLength = 24) {
        return IrisKeypair.generateMnemonic(switchToWordList(language), mnemonicLength);
    }
    
    recover(secret, language, path,  accAddr = Config.iris.bech32.accAddr) {
        path = path || Config.iris.bip39Path;
        if (accAddr && accAddr.length) {
            accAddress = accAddr;
        }
        let keyPair = IrisKeypair.recover(secret,switchToWordList(language), path);
        if (keyPair) {
            return encode({
                address: keyPair.address,
                phrase: secret,
                privateKey: keyPair.privateKey,
                publicKey: keyPair.publicKey
            });
        }
    }

    import(privateKey) {
        let keyPair = IrisKeypair.import(privateKey);
        if (keyPair) {
            return encode({
                address: keyPair.address,
                phrase: null,
                privateKey: keyPair.privateKey,
                publicKey: keyPair.publicKey
            });
        }
    }

    isValidAddress(address) {
        return IrisKeypair.isValidAddress(address);
    }

    isValidPrivate(privateKey) {
        return IrisKeypair.isValidPrivate(privateKey);
    }

    getAddress(publicKey) {
        let pubKey = Codec.Hex.hexToBytes(publicKey);
        let address = IrisKeypair.getAddress(pubKey);
        address = Codec.Bech32.toBech32(accAddress, address);
        return address;
    }
}

function encode(acc){
    if(!Utils.isEmpty(acc)){
        switch (Config.iris.defaultCoding){
            case Config.iris.coding.bech32:{
                if (Codec.Hex.isHex(acc.address)){
                    acc.address =  Codec.Bech32.toBech32(accAddress, acc.address);
                }
                if (Codec.Hex.isHex(acc.publicKey)){
                    acc.publicKey = Codec.Bech32.toBech32(Config.iris.bech32.accPub, acc.publicKey);
                }
            }
        }
        return acc
    }
}

function switchToWordList(language){
    switch (language) {
        case Config.language.cn:
            return Bip39.wordlists.chinese_simplified;
        case Config.language.en:
            return Bip39.wordlists.english;
        case Config.language.jp:
            return Bip39.wordlists.japanese;
        case Config.language.sp:
            return Bip39.wordlists.spanish;
        default:
            return Bip39.wordlists.english;
    }
}

module.exports = Old(IrisCrypto);
