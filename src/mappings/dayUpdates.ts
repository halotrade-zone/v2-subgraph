/* eslint-disable prefer-const */
import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'

import { Bundle, Pair, PairDayData, Token, TokenDayData, UniswapDayData, UniswapFactory } from '../types/schema'
import { FACTORY_ADDRESS } from '../utils/constants'
import { PairHourData, PairMinuteData, TokenHourData, TokenMinuteData } from './../types/schema'
import { ONE_BI, ZERO_BD, ZERO_BI } from './helpers'

export function updateUniswapDayData(event: ethereum.Event): UniswapDayData {
  let uniswap = UniswapFactory.load(FACTORY_ADDRESS)!
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let uniswapDayData = UniswapDayData.load(dayID.toString())
  if (uniswapDayData === null) {
    uniswapDayData = new UniswapDayData(dayID.toString())
    uniswapDayData.date = dayStartTimestamp
    uniswapDayData.dailyVolumeUSD = ZERO_BD
    uniswapDayData.dailyVolumeETH = ZERO_BD
    uniswapDayData.totalVolumeUSD = ZERO_BD
    uniswapDayData.totalVolumeETH = ZERO_BD
    uniswapDayData.dailyVolumeUntracked = ZERO_BD
  }

  uniswapDayData.totalLiquidityUSD = uniswap.totalLiquidityUSD
  uniswapDayData.totalLiquidityETH = uniswap.totalLiquidityETH
  uniswapDayData.txCount = uniswap.txCount
  uniswapDayData.save()

  return uniswapDayData as UniswapDayData
}

export function updatePairDayData(event: ethereum.Event): PairDayData {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let dayPairID = event.address.toHexString().concat('-').concat(BigInt.fromI32(dayID).toString())
  let pair = Pair.load(event.address.toHexString())!
  let pairDayData = PairDayData.load(dayPairID)
  if (pairDayData === null) {
    pairDayData = new PairDayData(dayPairID)
    pairDayData.date = dayStartTimestamp
    pairDayData.token0 = pair.token0
    pairDayData.token1 = pair.token1
    pairDayData.pairAddress = event.address
    pairDayData.dailyVolumeToken0 = ZERO_BD
    pairDayData.dailyVolumeToken1 = ZERO_BD
    pairDayData.dailyVolumeUSD = ZERO_BD
    pairDayData.dailyTxns = ZERO_BI
  }

  pairDayData.totalSupply = pair.totalSupply
  pairDayData.reserve0 = pair.reserve0
  pairDayData.reserve1 = pair.reserve1
  pairDayData.reserveUSD = pair.reserveUSD
  pairDayData.dailyTxns = pairDayData.dailyTxns.plus(ONE_BI)
  pairDayData.save()

  return pairDayData as PairDayData
}

export function updatePairHourData(event: ethereum.Event): PairHourData {
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600 // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600 // want the rounded effect
  let hourPairID = event.address.toHexString().concat('-').concat(BigInt.fromI32(hourIndex).toString())
  let pair = Pair.load(event.address.toHexString())!
  let pairHourData = PairHourData.load(hourPairID)
  if (pairHourData === null) {
    pairHourData = new PairHourData(hourPairID)
    pairHourData.hourStartUnix = hourStartUnix
    pairHourData.pair = event.address.toHexString()
    pairHourData.hourlyVolumeToken0 = ZERO_BD
    pairHourData.hourlyVolumeToken1 = ZERO_BD
    pairHourData.hourlyVolumeUSD = ZERO_BD
    pairHourData.hourlyTxns = ZERO_BI
  }

  pairHourData.totalSupply = pair.totalSupply
  pairHourData.reserve0 = pair.reserve0
  pairHourData.reserve1 = pair.reserve1
  pairHourData.reserveUSD = pair.reserveUSD
  pairHourData.hourlyTxns = pairHourData.hourlyTxns.plus(ONE_BI)
  pairHourData.save()

  return pairHourData as PairHourData
}

export function updatePairMinuteData(event: ethereum.Event): PairMinuteData {
  let timestamp = event.block.timestamp.toI32()
  let minuteIndex = timestamp / 60 // get unique minute within unix history
  let minuteStartUnix = minuteIndex * 60
  let minutePairID = event.address.toHexString().concat('-').concat(BigInt.fromI32(minuteIndex).toString())
  let pair = Pair.load(event.address.toHexString())!
  let pairMinuteData = PairMinuteData.load(minutePairID)
  
  if (pairMinuteData === null) {
    pairMinuteData = new PairMinuteData(minutePairID)
    pairMinuteData.minuteStartUnix = minuteStartUnix
    pairMinuteData.pair = event.address.toHexString()
    pairMinuteData.minuteVolumeToken0 = ZERO_BD
    pairMinuteData.minuteVolumeToken1 = ZERO_BD
    pairMinuteData.minuteVolumeUSD = ZERO_BD
    pairMinuteData.minuteTxns = ZERO_BI
  }

  pairMinuteData.totalSupply = pair.totalSupply
  pairMinuteData.reserve0 = pair.reserve0
  pairMinuteData.reserve1 = pair.reserve1
  pairMinuteData.reserveUSD = pair.reserveUSD
  pairMinuteData.minuteTxns = pairMinuteData.minuteTxns.plus(ONE_BI)
  pairMinuteData.save() // <-- Here's the save call

  return pairMinuteData as PairMinuteData
}

export function updateTokenDayData(token: Token, event: ethereum.Event): TokenDayData {
  let bundle = Bundle.load('1')!
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let tokenDayID = token.id.toString().concat('-').concat(BigInt.fromI32(dayID).toString())

  let tokenDayData = TokenDayData.load(tokenDayID)
  if (tokenDayData === null) {
    tokenDayData = new TokenDayData(tokenDayID)
    tokenDayData.date = dayStartTimestamp
    tokenDayData.token = token.id
    tokenDayData.priceUSD = token.derivedETH.times(bundle.ethPrice)
    tokenDayData.dailyVolumeToken = ZERO_BD
    tokenDayData.dailyVolumeETH = ZERO_BD
    tokenDayData.dailyVolumeUSD = ZERO_BD
    tokenDayData.dailyTxns = ZERO_BI
    tokenDayData.totalLiquidityUSD = ZERO_BD
  }
  tokenDayData.priceUSD = token.derivedETH.times(bundle.ethPrice)
  tokenDayData.totalLiquidityToken = token.totalLiquidity
  tokenDayData.totalLiquidityETH = token.totalLiquidity.times(token.derivedETH as BigDecimal)
  tokenDayData.totalLiquidityUSD = tokenDayData.totalLiquidityETH.times(bundle.ethPrice)
  tokenDayData.dailyTxns = tokenDayData.dailyTxns.plus(ONE_BI)
  tokenDayData.save()

  /**
   * @todo test if this speeds up sync
   */
  // updateStoredTokens(tokenDayData as TokenDayData, dayID)
  // updateStoredPairs(tokenDayData as TokenDayData, dayPairID)

  return tokenDayData as TokenDayData
}

export function updateTokenHourData(token: Token, event: ethereum.Event): TokenHourData {
  let bundle = Bundle.load('1')!
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600
  let hourStartUnix = hourIndex * 3600
  let tokenHourID = token.id.toString().concat('-').concat(BigInt.fromI32(hourIndex).toString())

  let tokenHourData = TokenHourData.load(tokenHourID)
  if (tokenHourData === null) {
    tokenHourData = new TokenHourData(tokenHourID)
    tokenHourData.hourStartUnix = hourStartUnix
    tokenHourData.token = token.id
    tokenHourData.priceUSD = token.derivedETH.times(bundle.ethPrice)
    tokenHourData.hourlyVolumeToken = ZERO_BD
    tokenHourData.hourlyVolumeETH = ZERO_BD
    tokenHourData.hourlyVolumeUSD = ZERO_BD
    tokenHourData.hourlyTxns = ZERO_BI
    tokenHourData.totalLiquidityUSD = ZERO_BD
  }

  tokenHourData.priceUSD = token.derivedETH.times(bundle.ethPrice)
  tokenHourData.totalLiquidityToken = token.totalLiquidity
  tokenHourData.totalLiquidityETH = token.totalLiquidity.times(token.derivedETH as BigDecimal)
  tokenHourData.totalLiquidityUSD = tokenHourData.totalLiquidityETH.times(bundle.ethPrice)
  tokenHourData.hourlyTxns = tokenHourData.hourlyTxns.plus(ONE_BI)
  tokenHourData.save()

  return tokenHourData as TokenHourData
}

export function updateTokenMinuteData(token: Token, event: ethereum.Event): TokenMinuteData {
  let bundle = Bundle.load('1')!
  let timestamp = event.block.timestamp.toI32()
  let minuteIndex = timestamp / 60
  let minuteStartUnix = minuteIndex * 60
  let tokenMinuteID = token.id.toString().concat('-').concat(BigInt.fromI32(minuteIndex).toString())

  let tokenMinuteData = TokenMinuteData.load(tokenMinuteID)
  if (tokenMinuteData === null) {
    tokenMinuteData = new TokenMinuteData(tokenMinuteID)
    tokenMinuteData.minuteStartUnix = minuteStartUnix
    tokenMinuteData.token = token.id
    tokenMinuteData.priceUSD = token.derivedETH.times(bundle.ethPrice)
    tokenMinuteData.minuteVolumeToken = ZERO_BD
    tokenMinuteData.minuteVolumeETH = ZERO_BD
    tokenMinuteData.minuteVolumeUSD = ZERO_BD
    tokenMinuteData.minuteTxns = ZERO_BI
    tokenMinuteData.totalLiquidityUSD = ZERO_BD
  }

  tokenMinuteData.priceUSD = token.derivedETH.times(bundle.ethPrice)
  tokenMinuteData.totalLiquidityToken = token.totalLiquidity
  tokenMinuteData.totalLiquidityETH = token.totalLiquidity.times(token.derivedETH as BigDecimal)
  tokenMinuteData.totalLiquidityUSD = tokenMinuteData.totalLiquidityETH.times(bundle.ethPrice)
  tokenMinuteData.minuteTxns = tokenMinuteData.minuteTxns.plus(ONE_BI)
  tokenMinuteData.save()

  return tokenMinuteData as TokenMinuteData
}
