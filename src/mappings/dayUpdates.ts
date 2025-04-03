/* eslint-disable prefer-const */
import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'

import { Bundle, Pair, PairDayData, Token, TokenDayData, UniswapDayData, UniswapFactory } from '../types/schema'
import { FACTORY_ADDRESS } from '../utils/constants'
import { PairHourData, PairMinuteData, TokenHourData, TokenMinuteData } from './../types/schema'
import { ONE_BI, ZERO_BD, ZERO_BI } from './helpers'

/**
 * Updates the daily aggregated data for the Uniswap protocol
 * @param event The event that triggered this update
 * @returns The updated or newly created UniswapDayData entity
 */
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

/**
 * Updates the daily aggregated data for a specific trading pair
 * @param event The event that triggered this update
 * @returns The updated or newly created PairDayData entity
 */
export function updatePairDayData(event: ethereum.Event): PairDayData {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let dayPairID = event.address
    .toHexString()
    .concat('-')
    .concat(BigInt.fromI32(dayID).toString())
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

/**
 * Updates the hourly aggregated data for a specific trading pair
 * @param event The event that triggered this update
 * @returns The updated or newly created PairHourData entity
 */
export function updatePairHourData(event: ethereum.Event): PairHourData {
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600 // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600 // want the rounded effect
  let hourPairID = event.address
    .toHexString()
    .concat('-')
    .concat(BigInt.fromI32(hourIndex).toString())
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

/**
 * Updates the minute-level aggregated data for a specific trading pair
 * @param event The event that triggered this update
 * @returns The updated or newly created PairMinuteData entity
 */
export function updatePairMinuteData(event: ethereum.Event): PairMinuteData {
  let timestamp = event.block.timestamp.toI32()
  let minuteIndex = timestamp / 60 // get unique minute within unix history
  let minuteStartUnix = minuteIndex * 60
  let minutePairID = event.address
    .toHexString()
    .concat('-')
    .concat(BigInt.fromI32(minuteIndex).toString())
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

/**
 * Updates the daily aggregated data for a specific token, including filling gaps in historical data
 * @param token The token entity to update data for
 * @param event The event that triggered this update
 * @returns The updated or newly created TokenDayData entity
 */
export function updateTokenDayData(token: Token, event: ethereum.Event): TokenDayData {
  let bundle = Bundle.load('1')!
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400

  // Fill missing day data
  let prevDayID = dayID - 1
  let lastDayData: TokenDayData | null = null

  // Find last saved day data
  for (let i = prevDayID; i > prevDayID - 7; i--) {
    let prevID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(i).toString())
    let prevData = TokenDayData.load(prevID)
    if (prevData !== null) {
      lastDayData = prevData
      break
    }
  }

  // Fill gaps with last known values
  for (let i = prevDayID; i < dayID; i++) {
    let thisID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(i).toString())
    let thisData = TokenDayData.load(thisID)

    if (thisData === null) {
      thisData = new TokenDayData(thisID)
      thisData.date = i * 86400
      thisData.token = token.id

      if (lastDayData !== null) {
        thisData.priceUSD = lastDayData.priceUSD
        thisData.totalLiquidityToken = lastDayData.totalLiquidityToken
        thisData.totalLiquidityETH = lastDayData.totalLiquidityETH
        thisData.totalLiquidityUSD = lastDayData.totalLiquidityUSD
      } else {
        thisData.priceUSD = token.derivedETH.times(bundle.ethPrice)
        thisData.totalLiquidityToken = token.totalLiquidity
        thisData.totalLiquidityETH = token.totalLiquidity.times(token.derivedETH as BigDecimal)
        thisData.totalLiquidityUSD = thisData.totalLiquidityETH.times(bundle.ethPrice)
      }

      thisData.dailyVolumeToken = ZERO_BD
      thisData.dailyVolumeETH = ZERO_BD
      thisData.dailyVolumeUSD = ZERO_BD
      thisData.dailyTxns = ZERO_BI
      thisData.save()
    }
  }

  // Get or create current day data
  let tokenDayID = token.id
    .toString()
    .concat('-')
    .concat(BigInt.fromI32(dayID).toString())
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

/**
 * Updates the hourly aggregated data for a specific token, including filling gaps in historical data
 * @param token The token entity to update data for
 * @param event The event that triggered this update
 * @returns The updated or newly created TokenHourData entity
 */
export function updateTokenHourData(token: Token, event: ethereum.Event): TokenHourData {
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600
  let hourStartUnix = hourIndex * 3600
  let bundle = Bundle.load('1')!

  // Fill missing hour data
  let prevHourIndex = hourIndex - 1
  let lastHourData: TokenHourData | null = null

  // Find last saved hour data
  for (let i = prevHourIndex; i > prevHourIndex - 24; i--) {
    let prevID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(i).toString())
    let prevData = TokenHourData.load(prevID)
    if (prevData !== null) {
      lastHourData = prevData
      break
    }
  }

  // Fill gaps with last known values
  for (let i = prevHourIndex; i < hourIndex; i++) {
    let thisID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(i).toString())
    let thisData = TokenHourData.load(thisID)

    if (thisData === null) {
      thisData = new TokenHourData(thisID)
      thisData.hourStartUnix = i * 3600
      thisData.token = token.id

      if (lastHourData !== null) {
        thisData.priceUSD = lastHourData.priceUSD
        thisData.totalLiquidityToken = lastHourData.totalLiquidityToken
        thisData.totalLiquidityETH = lastHourData.totalLiquidityETH
        thisData.totalLiquidityUSD = lastHourData.totalLiquidityUSD
      } else {
        let bundle = Bundle.load('1')!
        thisData.priceUSD = token.derivedETH.times(bundle.ethPrice)
        thisData.totalLiquidityToken = token.totalLiquidity
        thisData.totalLiquidityETH = token.totalLiquidity.times(token.derivedETH as BigDecimal)
        thisData.totalLiquidityUSD = thisData.totalLiquidityETH.times(bundle.ethPrice)
      }

      thisData.hourlyVolumeToken = ZERO_BD
      thisData.hourlyVolumeETH = ZERO_BD
      thisData.hourlyVolumeUSD = ZERO_BD
      thisData.hourlyTxns = ZERO_BI
      thisData.save()
    }
  }

  // Get or create current hour data
  let hourID = token.id
    .toString()
    .concat('-')
    .concat(BigInt.fromI32(hourIndex).toString())
  let tokenHourData = TokenHourData.load(hourID)
  if (tokenHourData === null) {
    tokenHourData = new TokenHourData(hourID)
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

/**
 * Updates the minute-level aggregated data for a specific token, including filling gaps in historical data
 * @param token The token entity to update data for
 * @param event The event that triggered this update
 * @returns The updated or newly created TokenMinuteData entity
 */
export function updateTokenMinuteData(token: Token, event: ethereum.Event): TokenMinuteData {
  let timestamp = event.block.timestamp.toI32()
  let minuteIndex = timestamp / 60
  let minuteStartUnix = minuteIndex * 60
  let bundle = Bundle.load('1')!

  // Fill missing minute data
  let prevMinuteIndex = minuteIndex - 1
  let lastMinuteData: TokenMinuteData | null = null

  // Find last saved minute data
  for (let i = prevMinuteIndex; i > prevMinuteIndex - 60; i--) {
    let prevID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(i).toString())
    let prevData = TokenMinuteData.load(prevID)
    if (prevData !== null) {
      lastMinuteData = prevData
      break
    }
  }

  // Fill gaps with last known values
  for (let i = prevMinuteIndex; i < minuteIndex; i++) {
    let thisID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(i).toString())
    let thisData = TokenMinuteData.load(thisID)

    if (thisData === null) {
      thisData = new TokenMinuteData(thisID)
      thisData.minuteStartUnix = i * 60
      thisData.token = token.id

      if (lastMinuteData !== null) {
        thisData.priceUSD = lastMinuteData.priceUSD
        thisData.totalLiquidityToken = lastMinuteData.totalLiquidityToken
        thisData.totalLiquidityETH = lastMinuteData.totalLiquidityETH
        thisData.totalLiquidityUSD = lastMinuteData.totalLiquidityUSD
      } else {
        let bundle = Bundle.load('1')!
        thisData.priceUSD = token.derivedETH.times(bundle.ethPrice)
        thisData.totalLiquidityToken = token.totalLiquidity
        thisData.totalLiquidityETH = token.totalLiquidity.times(token.derivedETH as BigDecimal)
        thisData.totalLiquidityUSD = thisData.totalLiquidityETH.times(bundle.ethPrice)
      }

      thisData.minuteVolumeToken = ZERO_BD
      thisData.minuteVolumeETH = ZERO_BD
      thisData.minuteVolumeUSD = ZERO_BD
      thisData.minuteTxns = ZERO_BI
      thisData.save()
    }
  }

  // Get or create current minute data
  let minuteID = token.id
    .toString()
    .concat('-')
    .concat(BigInt.fromI32(minuteIndex).toString())
  let tokenMinuteData = TokenMinuteData.load(minuteID)
  if (tokenMinuteData === null) {
    tokenMinuteData = new TokenMinuteData(minuteID)
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
  tokenMinuteData.save()

  return tokenMinuteData as TokenMinuteData
}

/**
 * Fills in missing minute-level data points for a token by copying the last known values
 * Used to ensure continuity in historical data even during periods of network downtime
 * @param token The token entity to fill data for
 * @param event The event that triggered this backfill
 */
export function fillTokenMinuteData(token: Token, event: ethereum.Event): void {
  let timestamp = event.block.timestamp.toI32()
  let minuteIndex = timestamp / 60
  let lastMinuteData: TokenMinuteData | null = null

  // Find last saved minute data
  for (let i = minuteIndex - 1; i > minuteIndex - 60 && lastMinuteData === null; i--) {
    let previousID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(i).toString())
    lastMinuteData = TokenMinuteData.load(previousID)
  }

  // Fill missing minutes with last known values
  for (let i = minuteIndex - 1; i < minuteIndex; i++) {
    let minuteID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(i).toString())
    let minuteData = TokenMinuteData.load(minuteID)

    if (minuteData === null) {
      minuteData = new TokenMinuteData(minuteID)
      minuteData.minuteStartUnix = i * 60
      minuteData.token = token.id

      // Copy values from last known data or initialize with current values
      if (lastMinuteData !== null) {
        minuteData.priceUSD = lastMinuteData.priceUSD
        minuteData.totalLiquidityToken = lastMinuteData.totalLiquidityToken
        minuteData.totalLiquidityETH = lastMinuteData.totalLiquidityETH
        minuteData.totalLiquidityUSD = lastMinuteData.totalLiquidityUSD
      } else {
        let bundle = Bundle.load('1')!
        minuteData.priceUSD = token.derivedETH.times(bundle.ethPrice)
        minuteData.totalLiquidityToken = token.totalLiquidity
        minuteData.totalLiquidityETH = token.totalLiquidity.times(token.derivedETH as BigDecimal)
        minuteData.totalLiquidityUSD = minuteData.totalLiquidityETH.times(bundle.ethPrice)
      }

      minuteData.minuteVolumeToken = ZERO_BD
      minuteData.minuteVolumeETH = ZERO_BD
      minuteData.minuteVolumeUSD = ZERO_BD
      minuteData.minuteTxns = ZERO_BI
      minuteData.save()
    }
  }
}

/**
 * Fills in missing hourly data points for a token by copying the last known values
 * Used to ensure continuity in historical data even during periods of network downtime
 * @param token The token entity to fill data for
 * @param event The event that triggered this backfill
 */
export function fillTokenHourData(token: Token, event: ethereum.Event): void {
  // Similar implementation for hourly data
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600
  let lastHourData: TokenHourData | null = null

  // Find last saved hour data
  for (let i = hourIndex - 1; i > hourIndex - 24 && lastHourData === null; i--) {
    let previousID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(i).toString())
    lastHourData = TokenHourData.load(previousID)
  }

  // Fill missing hours
  for (let i = hourIndex - 1; i < hourIndex; i++) {
    let hourID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(i).toString())
    let hourData = TokenHourData.load(hourID)

    if (hourData === null) {
      hourData = new TokenHourData(hourID)
      hourData.hourStartUnix = i * 3600
      hourData.token = token.id

      // Copy values from last known data or initialize with current values
      if (lastHourData !== null) {
        hourData.priceUSD = lastHourData.priceUSD
        hourData.totalLiquidityToken = lastHourData.totalLiquidityToken
        hourData.totalLiquidityETH = lastHourData.totalLiquidityETH
        hourData.totalLiquidityUSD = lastHourData.totalLiquidityUSD
      } else {
        let bundle = Bundle.load('1')!
        hourData.priceUSD = token.derivedETH.times(bundle.ethPrice)
        hourData.totalLiquidityToken = token.totalLiquidity
        hourData.totalLiquidityETH = token.totalLiquidity.times(token.derivedETH as BigDecimal)
        hourData.totalLiquidityUSD = hourData.totalLiquidityETH.times(bundle.ethPrice)
      }

      hourData.hourlyVolumeToken = ZERO_BD
      hourData.hourlyVolumeETH = ZERO_BD
      hourData.hourlyVolumeUSD = ZERO_BD
      hourData.hourlyTxns = ZERO_BI
      hourData.save()
    }
  }
}
