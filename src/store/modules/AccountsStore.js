// 钱包账户地址
import { createAccount as createAccountApi, readAccounts,
    saveAccounts, readAccountData, saveAccountData,deleteAccountData } from '../../api/storage'
import { getDefaultTradePairs } from '../../api/gateways'
import { getOrderbook } from '../../api/orderbook'
import { getAsset } from '../../api/assets'
import { fetchEffects } from '../../api/effects'
import { queryOffer } from '../../api/offer'

// 状态字段
const state = {
  error:undefined,
  //当前所有的账户,保存到文件中
  data: [],
  // 当前操作的账户序号，保存到文件中
  selected:-1,
  // 当前操作的账户信息
  selectedAccount:{
    name:null,// 钱包名称
    address: null,// 钱包地址
    federationAddress: null,//联邦地址
    inflationAddress: null,//通账地址
    memo: null // 钱包备注
  },
  password: null,
  //当前选中账户的数据信息（需要个人密码才能解密查看）,需要持久化
  accountData: {
    // 私钥地址
    seed: null,
    tradepairs:[]//交易对，新建账户时将给赋默认值（gateways.js）
  },
  //当前选中的tradepair
  selectedTradePair:{
    index: -1,
    tradepair:{},
    bids:[],//买单
    asks:[],//卖单
    my: []//我的委单
  },
  effects:{
    records: [],
    nextPage: null
  },
}

const BLANK_ACCOUNT = {seed: null, tradepairs: []}

const actions = {
  cleanAccountData({commit}){
    commit(CLEAN_ACCOUNT_DATA)
  },
  // 加载所有账户
  async loadAccounts ({ commit }) {
    commit(LOAD_ACCOUNTS, await readAccounts())
  },
  async saveAccountsAction({commit,state}){
    let accounts = {data: state.data, selected: state.selected}
    await saveAccounts(accounts)
  },
  // 输入密码切换账户
  // @param index 序号
  // @param address 地址
  // @param password 密码
  async changeAccount({dispatch, commit, state}, {index, address, password}){
    console.log('ready to change account')
    console.log(address)
    console.log(password)
    commit(CLEAN_ACCOUNT_DATA)
    let data = await readAccountData(address,password)
    console.log('change account ok ')
    console.log(data)
    commit(CHANGE_ACCOUNT, { index, address, password, accountdata:data} )
    dispatch('saveAccountsAction')
    dispatch('cleanAccount')
    dispatch('getAccountInfo', address)
  },
  /**
   * 无密码切换账户（只能查询）
   * @param {Object} param0  vuex参数
   * @param {int} index 切换的账户序号
   * @param {String} address 账户地址
   */
  async changeAccountNoPassword({dispatch, commit, state}, {index, address}){
    commit(CLEAN_ACCOUNT_DATA)
    commit(CHANGE_ACCOUNT_NO_PASSWORD, { index, address} )
    dispatch('saveAccountsAction')
    dispatch('getAccountInfo',address)
  },
  // 创建账户
  async createAccount({dispatch,commit,state}, {name,address,seed, password, memo}){
    let newaccount = {name,address,memo}
    let tradepairs = getDefaultTradePairs()
    let newaccountdata = Object.assign({},BLANK_ACCOUNT, {seed:seed,tradepairs })
    let data = [...state.data,newaccount]
    let accounts = {data: data, selected: (data.length-1) }
    console.log('---create account')
    console.log(data)
    console.log(accounts)
    console.log(newaccountdata)
    await createAccountApi(accounts,address,newaccountdata, password)
    commit(CREATE_ACCOUNT, { accounts, password, newaccountdata} )
    dispatch('cleanAccount')
  },
  //覆盖账户
  async coverAccount({dispatch,commit,state},{name,address,seed, password, memo}){
    let tradepairs = getDefaultTradePairs()
    let newaccountdata = Object.assign({},BLANK_ACCOUNT, {seed:seed,tradepairs })
    await saveAccountData(address,newaccountdata,password)
    let index = -1
    let account = null
    for(var i=0,n=state.data.length;i<n;i++){
      if(state.data[i].address === address){
        index = i
        account = state.data[i]
        break
      }
    }
    account.name = name
    account.memo = memo
    dispatch('updateAccount',{index,account})
    dispatch('changeAccount',{index, address, password})
  },
  // 修改账户
  async updateAccount({dispatch, commit, state}, {index, account}){
    let data = [...state.data]
    data[index] = account
    let accounts = { data: data, selected: state.selected }
    await saveAccounts(accounts)
    commit(LOAD_ACCOUNTS, accounts)
    // dispatch('cleanAccount')
  },
  /**
   * 重置账户密码
   */
  async resetAccountPwd({dispatch, commit, state}, {index, account, password, newpassword}){
    let address = account.address
    let data = await readAccountData(address,password)
    await saveAccountData(address,data,newpassword)
    commit(RESET_PASSWORD, {index, newpassword})
  },
  // 删除账户
  async deleteAccount({dispatch, commit, state}, {index, account}){
    let statedata = [...state.data]
    let data = statedata.splice(index,1)
    let selected = state.selected
    if(index === selected ) {
      selected = 0 //默认查询第1个
    }else if(index < selected){
      selected--
    }
    let accounts = { data: statedata, selected: selected }
    await saveAccounts(accounts)
    await deleteAccountData(account.address)
    commit(CLEAN_ACCOUNT_DATA)
    commit(LOAD_ACCOUNTS, accounts)
    //dispatch('cleanAccount')
  },

  //删除交易对
  async deleteTradePair({dispatch,commit,state},{index,tradepair}){
    let pairs = [...state.accountData.tradepairs]
    let delpair = pairs.splice(index,1)
    let data = Object.assign({}, state.accountData, { tradepairs: pairs})
    await saveAccountData(state.selectedAccount.address, data, state.password)
    commit(LOAD_ACCOUNT_DATA,data)

  },

  //添加交易对
  async addTradePair({dispatch,commit,state},tradepair){
    let pairs = [...state.accountData.tradepairs]
    pairs.push(tradepair)
    let data = Object.assign({}, state.accountData, { tradepairs: pairs})
    await saveAccountData(state.selectedAccount.address, data, state.password)
    commit(LOAD_ACCOUNT_DATA,data)
  },

  //交换交易对
  async switchTradePair({dispatch,commit,state},{index,tradepair}){
    let pairs = [...state.accountData.tradepairs]
    pairs[index] = tradepair
    let data = Object.assign({}, state.accountData, { tradepairs: pairs})
    await saveAccountData(state.selectedAccount.address, data, state.password)
    commit(LOAD_ACCOUNT_DATA,data)
  },

  // 选中某个交易对
  selectTradePair({commit,state},{index,tradepair}){
    commit(SELECT_TRADE_PAIR,{index, tradepair})
  },
  //查询当前的盘面
  async queryOrderBook({commit,state}){
    let buyAsset = getAsset(state.selectedTradePair.tradepair.to.code,
        state.selectedTradePair.tradepair.to.issuer)
    let sellAsset = getAsset(state.selectedTradePair.tradepair.from.code,
        state.selectedTradePair.tradepair.from.issuer)
    let records = await getOrderbook(sellAsset,buyAsset)
    // console.log(`---------------query order book : ${records}`)
    commit(QUERY_ORDERBOOK,records)
  },

  //交换当前盘面资产
  async switchSelectedTradePair({dispatch,commit,state}){
    let tradepair = {from: state.selectedTradePair.to, to: state.selectedTradePair.from}
    commit(SELECT_TRADE_PAIR,{index, tradepair})
    await dispatch('queryOrderBook')
    await dispatch('queryMyOffers')
  },

  //查询我的委单（所有的，需要手动过滤）
  async queryMyOffers({dispatch,commit,state}){
    let records = await queryOffer(state.selectedAccount.address)
    commit(QUERY_MY_OFFERS,records)
  },
  //盘面监听得到数据后处理
  orderBookStreamHandler({commit,state}, data){
    commit(ORDERBOOK_STREAM_HANDLER, data)
  },





  // TODO: 分页获取我的交易记录，获取的数据是未处理的，需要进一步处理，只保留 type 为 trade 的
  async queryMyEffects({commit,state}, nextPage=false) {
    let queryData;
    let recordPerPage = 20;
    if (!nextPage) {
      commit(CLEAN_MY_EFFECTS)
      queryData = await fetchEffects(state.selectedAccount.address, 'desc', recordPerPage)
    } else {
      if (!state.effects.nextPage) {
        throw new Error('No nextPage, please check state.accounts.effects.nextPage first.');
      }
      queryData = await state.effects.nextPage()
    }
    if (queryData.records.length < recordPerPage) {
      queryData.next = null
    }
    queryData.records = queryData.records.filter(x => x.type == 'trade')
    console.log(queryData);
    commit(QUERY_MY_EFFECTS, queryData)
  },
}

const mutations = {
  LOAD_ACCOUNTS(state, accounts){
    state.data = accounts.data
    state.selected = accounts.selected
    let account = accounts.data[accounts.selected]
    if(account){
      state.selectedAccount = account
    }else{
      state.selectedAccount = {name: null , address: null, memo: null}
    }
  },
  CHANGE_ACCOUNT_NO_PASSWORD(state, { index, address}){
    state.selected = index
    state.password = null
    state.selectedAccount = state.data[index]
    state.accountData = Object.assign({},BLANK_ACCOUNT)
  },
  CHANGE_ACCOUNT(state, {index, address, password, accountdata}){
    // 当前选择的账户信息要调整
    state.selected = index
    state.password = password
    state.selectedAccount = state.data[index]
    state.accountData = accountdata
  },
  CREATE_ACCOUNT(state, { accounts, password, newaccountdata}){
    console.log('create account mutation')
    console.log(accounts)
    console.log(password)
    console.log(newaccountdata)
    state.data = accounts.data
    state.selected = accounts.data.length - 1
    state.selectedAccount = accounts.data[state.selected]
    state.password = password
    state.accountData = newaccountdata
  },
  LOAD_ACCOUNT_DATA(state,accountData){
    state.accountData = accountData
  },
  CLEAN_ACCOUNT_DATA(state){
    state.accountData = {
        seed: null,
        contacts:[],
        tradepairs:[]
      }
      state.selectedTradePair = {
        index: -1,
        tradepair:{},
        bids:[],//买单
        asks:[],//卖单
        my: []//我的委单
      }
  },

  SELECT_TRADE_PAIR(state, { index, tradepair}){
    state.selectedTradePair = {
      index,
      tradepair,
      bids:[],
      asks:[],
      my: []
    }
  },
  QUERY_ORDERBOOK(state,records){
    state.selectedTradePair.bids = records.bids
    state.selectedTradePair.asks = records.asks
  },
  QUERY_MY_OFFERS(state,records){
    state.selectedTradePair.my = records
  },

  ORDERBOOK_STREAM_HANDLER(state,data){
    console.log('-------------------------state ORDERBOOK_STREAM_HANDLER')
    console.log(data)
  },
  RESET_PASSWORD(state,{index,newpassword}){
    if(index === state.selected){
      state.password = newpassword;
    }
  },
  QUERY_MY_EFFECTS(state, data) {
    state.effects.records.push(...data.records)
    state.effects.nextPage = data.next
  },
  CLEAN_MY_EFFECTS(state) {
    state.effects.records = []
    state.effects.nextPage = null
  }

}

export default {
  state,
  actions,
  mutations
}

export const LOAD_ACCOUNTS = 'LOAD_ACCOUNTS'
export const CHANGE_ACCOUNT = 'CHANGE_ACCOUNT'
export const CREATE_ACCOUNT = 'CREATE_ACCOUNT'
export const LOAD_ACCOUNT_DATA = 'LOAD_ACCOUNT_DATA'
export const CHANGE_ACCOUNT_NO_PASSWORD = 'CHANGE_ACCOUNT_NO_PASSWORD'
export const CLEAN_ACCOUNT_DATA = 'CLEAN_ACCOUNT_DATA'

export const SELECT_TRADE_PAIR = 'SELECT_TRADE_PAIR'
export const QUERY_ORDERBOOK = 'QUERY_ORDERBOOK'
export const QUERY_MY_OFFERS = 'QUERY_MY_OFFERS'
export const ORDERBOOK_STREAM_HANDLER = 'ORDERBOOK_STREAM_HANDLER'
export const CONTACT_ID_INCREMENT = 'CONTACT_ID_INCREMENT'
export const RESET_PASSWORD = 'RESET_PASSWORD'
export const QUERY_MY_EFFECTS = 'QUERY_MY_EFFECTS'
export const CLEAN_MY_EFFECTS = 'CLEAN_MY_EFFECTS'
