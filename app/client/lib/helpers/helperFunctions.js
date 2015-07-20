/**
Helper functions

@module Helpers
**/

/**
The Helpers class containing helper functions

@class Helpers
@constructor
**/
Helpers = {};

/**
Reruns functions reactively, based on an interval. Use it like so:

    Helpers.rerun['10s'].tick();


@method rerun
**/
Helpers.rerun = {
    '10s': new ReactiveTimer(10)
};


/**
Clear localStorage

@method getLocalStorageSize
**/
Helpers.getLocalStorageSize = function(){

    var size = 0;
    if(localStorage) {
        _.each(Object.keys(localStorage), function(key){
            size += localStorage[key].length * 2 / 1024 / 1024;
        });
    }

    return size;
};

/**
Make a ID out of a given hash and prefix.

@method makeId
@param {String} prefix
@param {String} hash
*/
Helpers.makeId = function(prefix, hash){
    return prefix +'_'+ hash.replace('0x','').substr(0,10);
};

/**
Display logs in the console for events.

@method eventLogs
*/
Helpers.eventLogs = function(){
    var args = arguments;
    Array.prototype.unshift.call(args, 'EVENT LOG: ');
    console.log.apply(console, args);
}

/**
Check if the given wallet is a watch only wallet, by checking if we are one of owners in the wallet.

@method isWatchOnly
@param {String} id the id of the wallet to check
*/
Helpers.isWatchOnly = function(id) {
    return !Wallets.findOne({_id: id, owners: {$in: _.pluck(EthAccounts.find({}).fetch(), 'address')}});
};

/**
Gets the docuement matching the given addess from the EthAccounts or Wallets collection.

@method getAccountByAddress
@param {String} address
*/
Helpers.getAccountByAddress = function(address) {
    return EthAccounts.findOne({address: address}) || Wallets.findOne({address: address});
};

/**
Reactive wrapper for the moment package.

@method moment
@param {String} time    a date object passed to moment function.
@return {Object} the moment js package
**/
Helpers.moment = function(time){

    // react to language changes as well
    TAPi18n.getLanguage();

    if(_.isFinite(time) && moment.unix(time).isValid())
        return moment.unix(time);
    else
        return moment(time);

};


/**
Formats a timestamp to any format given.

    Helpers.formatTime(myTime, "YYYY-MM-DD")

@method formatTime
@param {String} time         The timstamp, can be string or unix format
@param {String} format       the format string, can also be "iso", to format to ISO string, or "fromnow"
@return {String} The formated time
**/
Helpers.formatTime = function(time, format) { //parameters
    
    // make sure not existing values are not Spacebars.kw
    if(format instanceof Spacebars.kw)
        format = null;

    if(time) {

        if(_.isString(format) && !_.isEmpty(format)) {

            if(format.toLowerCase() === 'iso')
                time = Helpers.moment(time).toISOString();
            else if(format.toLowerCase() === 'fromnow') {
                // make reactive updating
                Helpers.rerun['10s'].tick();
                time = Helpers.moment(time).fromNow();
            } else
                time = Helpers.moment(time).format(format);
        }

        return time;

    } else
        return '';
};


/**
Formats a given number

    Helpers.formatNumber(10000, "0.0[000]")

@method formatNumber
@param {Number|String|BigNumber} number the number to format
@param {String} format           the format string e.g. "0.0[000]" see http://numeraljs.com for more.
@return {String} The formated time
**/
Helpers.formatNumber = function(number, format){
    if(format instanceof Spacebars.kw)
        format = null;

    if(number instanceof BigNumber)
        number = number.toString(10);

    format = format || '0,0.0[0000]';

    if(!_.isFinite(number))
        number = numeral().unformat(number);

    if(_.isFinite(number))
        return numeral(number).format(format);
};


/**
Formats a given number toa unit balance

    Helpers.formatBalance(10000, "0.0[000]")

@method formatBalance
@param {Number|String|BigNumber} number the number to format
@param {String} format           the format string e.g. "0.0[000]" see http://numeraljs.com for more.
@return {String} The formated balance including the unit
**/
Helpers.formatBalance = function(number, format){
    number = web3.fromWei(number, LocalStore.get('etherUnit'));

    return Helpers.formatNumber(number, format) +' '+ LocalStore.get('etherUnit');
};