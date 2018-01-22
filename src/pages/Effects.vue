/**
 * 交易历史界面
 */
<template>
  <div class="page" >
    <toolbar :title="'Effects Records Demo'"
      :showmenuicon="showmenuicon"
      :showbackicon="showbackicon"
      @goback="back"
      />
    </toolbar>

    <card class="offer-card" padding="10px 10px">
      <div class="buyoffer-table offer-table" slot="card-content">
        <div class="table-head body-2">
          <div class="headcol">买入</div>
          <div class="headcol">卖出</div>
          <div class="headcol">单价</div>
          <div class="headcol">转换</div>
        </div>
        <div class="table-row body-2" v-for="(item, index) in records">
          <div class="b-row price">+{{Number(item.bought_amount).toFixed(2)}} {{item.bought_asset_code || 'XLM'}}</div>
          <div class="b-row">-{{Number(item.sold_amount).toFixed(2)}} {{item.sold_asset_code || 'XLM'}}</div>
          <div class="b-row">以后写</div>
          <div class="b-row depth">....</div>
        </div>
      </div>
    </card>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'

import {mapState, mapActions, mapGetters} from 'vuex'
export default {
  data(){
    return {
      showbackicon: false,
      showmenuicon: true,
      records: []
    }
  },
  computed:{
    ...mapState({
      effects: state => state.accounts.effects
    }),
  },
  mounted(){
    this.load()
  },
  methods: {
    ...mapActions({
      queryMyEffects: 'queryMyEffects',
    }),
    back(){
      this.$router.back()
    },
    load(){
      this.queryMyEffects().then(this.records = this.effects.records)
    },

  },
  components: {
    Toolbar,
    Card,

  }


}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  .ordermenu
    display: flex
    font-size: 16px
    padding-top: 10px
    margin-bottom: 3px
    color: $secondarycolor.font
    .offermenu
      display: flex
      padding-left: 20px
      padding-right: 20px
    .offermenu.active
      border-bottom: 2px solid $primarycolor.green
  .table-head
    display: flex
    font-size: 18px
    color: $secondarycolor.font
    padding-top: 2px
    padding-bottom: 2px
    .headcol
      flex: 1
      text-align: right
    .headcol:nth-child(1)
      text-align: left
  .table-row
    display: flex
    font-size: 18px
    color: $secondarycolor.font
    padding-top: 10px
    /*margin-bottom: 20px*/
    .b-row
      flex: 1
      text-align: right
      padding-right: 1px
    .b-row.price
      text-align: left
    .b-row.depth
      text-align: right
      &>a
        color: $primarycolor.green


</style>
