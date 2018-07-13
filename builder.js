'use strict';

const Constants = require('./constants');

class Builder {

    /**
     * (冷钱包)
     *
     * 构造需要签名的交易内容,得到签名对象后，调用GetSignBytes()方法获取签名字符串
     *
     * @param tx {blockChainThriftModel.Tx} 请求内容
     * @returns {*}
     */
    buildTx(tx) {
        throw new Error("not implement");
    }


    /**
     * (冷钱包)
     *
     * 根据请求内容构造交易并对交易进行签名
     *
     * @param tx {*}
     * @param privateKey {string} 交易发送方私钥(hex编码)，冷钱包提供
     * @returns {StdTx} 交易
     */
    signTx(tx,privateKey) {
        throw new Error("not implement");
    }

    /**
     * (热钱包)
     *
     * 根据请求内容构造交易并对交易进行签名
     *
     * @param tx {blockChainThriftModel.Tx} 请求内容
     * @param privateKey 发送方账户私钥
     * @returns {StdTx}  交易
     */
    buildAndSignTx(tx, privateKey) {
        throw new Error("not implement");
    }

    /**
     * builder 构建方法，返回具体实现类
     *
     * @param chainName 链名字
     * @returns {*} 具体实现(iris_builder | ethermint_builder)
     */
    static getBuilder(chainName) {
        switch (chainName) {
            case Constants.Chains.IRIS: {
                return require('./chains/iris/iris_builder')();
            }
            case Constants.Chains.ETHERMINT: {
                return require('./chains/ethermint/ethermint_builder')();
            }
            default: {
                throw new Error("not correct chain");
            }
        }
    };

    /**
     * 将外部请求参数封装为crypto统一类型，与具体业务代码松耦合.由具体子类调用
     *
     * @param tx {blockChainThriftModel.Tx} 传入参数
     * @returns {{acc, to, coins, fees, gas, type}}
     */
    buildParam(tx){
        if (!tx.amount || tx.amount.length == 0) {
            throw new Error("amount not empty");
        }

        if (!tx.sender.addr || tx.sender.addr.length == 0) {
            throw new Error("sender not empty");
        }

        if (!tx.receiver || tx.receiver.length == 0) {
            throw new Error("sender not empty");
        }


        /*if (!tx.sequence) {
            throw new Error("sequence not empty");
        }*/

        let convert = function (tx) {
            let coins = [];
            tx.amount.forEach(function (item) {
                if (!item.denom || item.denom.length == 0) {
                    throw new Error("denom not empty");
                }
                if (item.amount < 0) {
                    throw new Error("amount must > 0");
                }
                coins.push({
                    "denom":item.denom,
                    "amount":item.amount,
                });
            });

            let fees = [];

            fees.push({
                "denom":tx.fee.denom,
                "amount":tx.fee.amount,
            });

            let fromAcc = new Account(tx.sender.addr, tx.sender.chain, tx.ext, tx.sequence);
            return new Request(fromAcc,tx.receiver.addr,coins,fees,tx.gas,tx.memo.text,tx.type);
        };

        return convert(tx);
    }
}

class Request {
    constructor(acc, to, coins, fees,gas,memo,type) {
        this.acc = acc;
        this.to = to;
        this.coins = coins;
        this.fees = fees;
        this.gas = gas;
        this.memo = memo;
        this.type = type
    }
}

class Account {
    constructor(address, chain_id, account_number, sequence) {
        this.address = address;
        this.chain_id = chain_id;
        this.account_number = account_number;
        this.sequence = sequence
    }
}

/**
 * 校验器接口
 *
 */
class Validator {
    ValidateBasic() {
        throw new Error("not implement");
    }
}

/**
 * 签名消息接口
 *
 */

class SignMsg extends Validator{
    GetSignBytes() {
        throw new Error("not implement");
    }
}

module.exports = {Builder,SignMsg,Validator};