import React, { useMemo, useState } from "react";

const STARTING_HAND_SIZE = 5;
const TURN_DRAW_COUNT = 2;
const TURN_ENERGY_GAIN = 5;
const MAX_ENERGY = 20;
const MAX_HAND_SIZE = 10;
const PLAYER_MAX_HP = 50;

function assetPath(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

const STARTER_DECK = [
  { id: "animal-cell-1", name: "상피세포", type: "세포", lineage: "animal", rarity: "common", cost: 1, attack: 4, block: 0, desc: "피해 4" },
  { id: "animal-cell-2", name: "근육세포", type: "세포", lineage: "animal", rarity: "common", cost: 1, attack: 5, block: 0, desc: "피해 5" },
  { id: "animal-tissue-1", name: "상피조직", type: "조직", lineage: "animal", rarity: "common", cost: 1, attack: 0, block: 6, desc: "방어 6" },
  { id: "animal-organ-1", name: "위", type: "기관", lineage: "animal", rarity: "rare", cost: 2, attack: 7, block: 3, desc: "피해 7, 방어 3" },
  { id: "animal-system-1", name: "소화계", type: "기관계", lineage: "animal", rarity: "rare", cost: 2, attack: 4, block: 4, energy: 1, desc: "피해 4, 방어 4, 에너지 +1" },
  { id: "animal-body-1", name: "사람", type: "개체", lineage: "animal", rarity: "legendary", cost: 3, attack: 12, block: 0, desc: "피해 12" },
  { id: "plant-cell-1", name: "표피세포", type: "세포", lineage: "plant", rarity: "common", cost: 1, attack: 3, block: 0, desc: "피해 3" },
  { id: "plant-cell-2", name: "공변세포", type: "세포", lineage: "plant", rarity: "rare", cost: 1, attack: 2, block: 0, energy: 1, desc: "피해 2, 에너지 +1" },
  { id: "plant-tissue-1", name: "표피조직", type: "조직", lineage: "plant", rarity: "common", cost: 1, attack: 0, block: 5, desc: "방어 5" },
  { id: "plant-system-1", name: "표피조직계", type: "조직계", lineage: "plant", rarity: "rare", cost: 2, attack: 4, block: 4, desc: "피해 4, 방어 4" },
  { id: "plant-system-2", name: "관다발조직계", type: "조직계", lineage: "plant", rarity: "rare", cost: 2, attack: 5, block: 3, draw: 1, desc: "피해 5, 방어 3, 카드 1장 드로우" },
  { id: "plant-organ-1", name: "잎", type: "기관", lineage: "plant", rarity: "rare", cost: 2, attack: 6, block: 0, desc: "피해 6" },
  { id: "plant-body-1", name: "나무", type: "개체", lineage: "plant", rarity: "legendary", cost: 3, attack: 11, block: 0, desc: "피해 11" },
];

const REWARD_CARDS = [
  { id: "animal-organ-lung", name: "폐", type: "기관", lineage: "animal", rarity: "rare", cost: 2, attack: 9, block: 2, desc: "피해 9, 방어 2" },
  { id: "animal-organ-heart", name: "심장", type: "기관", lineage: "animal", rarity: "rare", cost: 1, attack: 3, block: 7, desc: "피해 3, 방어 7" },
  { id: "animal-system-resp", name: "호흡계", type: "기관계", lineage: "animal", rarity: "rare", cost: 2, attack: 6, block: 3, draw: 1, desc: "피해 6, 방어 3, 카드 1장 드로우" },
  { id: "animal-body-human-strong", name: "강화된 사람", type: "개체", lineage: "animal", rarity: "legendary", cost: 4, attack: 18, block: 0, desc: "피해 18" },
  { id: "plant-organ-root", name: "뿌리", type: "기관", lineage: "plant", rarity: "common", cost: 1, attack: 2, block: 8, desc: "피해 2, 방어 8" },
  { id: "plant-organ-stem", name: "줄기", type: "기관", lineage: "plant", rarity: "rare", cost: 1, attack: 5, block: 3, energy: 1, desc: "피해 5, 방어 3, 에너지 +1" },
  { id: "plant-body-flower", name: "꽃식물", type: "개체", lineage: "plant", rarity: "legendary", cost: 2, attack: 10, block: 2, desc: "피해 10, 방어 2" },
  { id: "plant-system-vascular-plus", name: "강화 관다발조직계", type: "조직계", lineage: "plant", rarity: "legendary", cost: 3, attack: 8, block: 5, draw: 1, desc: "피해 8, 방어 5, 카드 1장 드로우" },
];

const ENEMIES = [
  { name: "흩어진 세포 덩어리", hp: 40, intent: 7, image: "monster1.png" },
  { name: "불완전한 조직체", hp: 55, intent: 10, image: "monster2.png" },
  { name: "무질서한 기관계", hp: 75, intent: 13, image: "monster3.png" },
];

const BIO_ORDER_BY_LINEAGE = {
  animal: ["세포", "조직", "기관", "기관계", "개체"],
  plant: ["세포", "조직", "조직계", "기관", "개체"],
};

const COMBO_MULTIPLIER = { 0: 1, 1: 1, 2: 1.3, 3: 1.6, 4: 2, 5: 3 };
const MIXED_COMBO_MULTIPLIER = { 0: 1, 1: 1, 2: 1.2, 3: 1.4, 4: 1.7, 5: 2.2 };
const LINEAGE_LABEL = { animal: "동물", plant: "식물" };
const RARITY_ORDER = { common: 0, rare: 1, legendary: 2 };
const REWARD_RARITY_TABLE = [
  { rarity: "common", chance: 0.6 },
  { rarity: "rare", chance: 0.3 },
  { rarity: "legendary", chance: 0.1 },
];

const CARD_THEME = {
  plant: { base: "#9BE15D", deep: "#0f3d1e", glow: "rgba(137,255,94,.72)" },
  animal: { base: "#5BC6FF", deep: "#0d2e4a", glow: "rgba(91,198,255,.66)" },
};
const RARITY_GLOW = {
  common: "rgba(180,197,180,.45)",
  rare: "rgba(91,198,255,.65)",
  legendary: "rgba(222,168,61,.85)",
};

function withUid(card, index = 0) {
  return { ...card, uid: `${card.id}-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}` };
}

function shuffle(cards) {
  return [...cards].sort(() => Math.random() - 0.5).map((card, index) => withUid(card, index));
}

function getRandomRewardRarity() {
  const roll = Math.random();
  let cumulative = 0;
  for (const item of REWARD_RARITY_TABLE) {
    cumulative += item.chance;
    if (roll <= cumulative) return item.rarity;
  }
  return "common";
}

function pickWeightedRewardCards(count) {
  const picked = [];
  const usedIds = new Set();
  while (picked.length < count && usedIds.size < REWARD_CARDS.length) {
    const rarity = getRandomRewardRarity();
    let pool = REWARD_CARDS.filter((card) => card.rarity === rarity && !usedIds.has(card.id));
    if (pool.length === 0) pool = REWARD_CARDS.filter((card) => !usedIds.has(card.id));
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(chosen.id);
    picked.push(withUid(chosen, picked.length));
  }
  return picked;
}

function drawCards(deck, discard, count) {
  let nextDeck = [...deck];
  let nextDiscard = [...discard];
  const drawn = [];
  for (let i = 0; i < count; i += 1) {
    if (nextDeck.length === 0) {
      nextDeck = shuffle(nextDiscard);
      nextDiscard = [];
    }
    const card = nextDeck.shift();
    if (card) drawn.push(card);
  }
  return { drawn, deck: nextDeck, discard: nextDiscard };
}

function sortCardsByRarity(cards) {
  return [...cards].sort((a, b) => {
    const rarityDiff = (RARITY_ORDER[a.rarity] ?? 99) - (RARITY_ORDER[b.rarity] ?? 99);
    if (rarityDiff !== 0) return rarityDiff;
    const lineageDiff = (a.lineage || "").localeCompare(b.lineage || "");
    if (lineageDiff !== 0) return lineageDiff;
    return (a.name || "").localeCompare(b.name || "", "ko");
  });
}

function trimHand(cards) {
  return sortCardsByRarity(cards).slice(0, MAX_HAND_SIZE);
}

function splitLineageRuns(cards) {
  const runs = [];
  for (const card of cards) {
    const previousRun = runs[runs.length - 1];
    if (previousRun && previousRun.lineage === card.lineage) {
      previousRun.cards.push(card);
    } else {
      runs.push({ lineage: card.lineage, cards: [card] });
    }
  }
  return runs;
}

function hasInterleavedLineage(runs) {
  const seen = new Set();
  for (const run of runs) {
    if (seen.has(run.lineage)) return true;
    seen.add(run.lineage);
  }
  return false;
}

function getBestComboInRun(run) {
  let bestCards = [];
  let currentCards = [];
  const order = BIO_ORDER_BY_LINEAGE[run.lineage] || [];

  for (const card of run.cards) {
    if (currentCards.length === 0) {
      currentCards = [card];
      continue;
    }

    const previous = currentCards[currentCards.length - 1];
    const previousIndex = order.indexOf(previous.type);
    const currentIndex = order.indexOf(card.type);
    const isConnected = previousIndex >= 0 && currentIndex === previousIndex + 1;

    if (isConnected) currentCards = [...currentCards, card];
    else {
      if (currentCards.length > bestCards.length) bestCards = currentCards;
      currentCards = [card];
    }
  }

  if (currentCards.length > bestCards.length) bestCards = currentCards;
  if (bestCards.length < 2) return null;

  return {
    lineage: run.lineage,
    length: bestCards.length,
    attack: bestCards.reduce((sum, item) => sum + (item.attack || 0), 0),
    cards: bestCards,
  };
}

function calculateComboDamage(cards) {
  const selectedAttack = cards.reduce((sum, card) => sum + (card.attack || 0), 0);
  const lineageRuns = splitLineageRuns(cards);
  if (hasInterleavedLineage(lineageRuns)) return { totalDamage: selectedAttack, bestLength: 0, selectedAttack, comboEntries: [], mode: "none" };

  const comboEntries = lineageRuns.map(getBestComboInRun).filter(Boolean);
  if (comboEntries.length === 0) return { totalDamage: selectedAttack, bestLength: 0, selectedAttack, comboEntries: [], mode: "none" };

  const comboCardUids = new Set();
  let comboDamage = 0;
  let bestLength = 0;
  const detailedCombos = comboEntries.map((combo) => {
    const multiplierTable = comboEntries.length > 1 ? MIXED_COMBO_MULTIPLIER : COMBO_MULTIPLIER;
    const multiplier = multiplierTable[combo.length] || 1;
    const damage = Math.floor(combo.attack * multiplier);
    combo.cards.forEach((card) => comboCardUids.add(card.uid));
    comboDamage += damage;
    bestLength = Math.max(bestLength, combo.length);
    return { ...combo, multiplier, damage };
  });
  const nonComboDamage = cards.reduce((sum, card) => (comboCardUids.has(card.uid) ? sum : sum + (card.attack || 0)), 0);
  return { totalDamage: comboDamage + nonComboDamage, bestLength, selectedAttack, comboEntries: detailedCombos, mode: comboEntries.length > 1 ? "mixed" : "single" };
}

function comboName(length, mode = "single", comboEntries = []) {
  if (mode === "mixed" && comboEntries.length > 1) return comboEntries.map((combo) => `${LINEAGE_LABEL[combo.lineage] || combo.lineage} ${combo.length}콤보`).join(" + ");
  if (length >= 5) return "완전 생명체 5콤보";
  if (length === 4) return "진화 4콤보";
  if (length === 3) return "성장 3콤보";
  if (length === 2) return "연결 2콤보";
  return "콤보 없음";
}

function getTurnOverflowWarning(energy, handSize) {
  const projectedEnergy = energy + TURN_ENERGY_GAIN;
  const projectedHandSize = handSize + TURN_DRAW_COUNT;
  const warnings = [];
  if (projectedEnergy > MAX_ENERGY) warnings.push(`에너지가 ${projectedEnergy}이 되어 최대치 ${MAX_ENERGY}을 넘습니다.`);
  if (projectedHandSize > MAX_HAND_SIZE) warnings.push(`손패가 ${projectedHandSize}장이 되어 최대치 ${MAX_HAND_SIZE}장을 넘습니다.`);
  return warnings.join(" ");
}

function CardImageSlot({ card }) {
  const icon = card.lineage === "plant" ? "🌿" : "🧬";
  return (
    <div className="card-art">
      <span>{icon}</span>
      <em>{card.type}</em>
    </div>
  );
}

function CardEffects({ card }) {
  const effects = [
    card.attack ? { icon: "⚔", text: card.attack } : null,
    card.block ? { icon: "🛡", text: card.block } : null,
    card.energy ? { icon: "⚡", text: `+${card.energy}` } : null,
    card.draw ? { icon: "▣", text: `+${card.draw}` } : null,
  ].filter(Boolean);
  return <div className="effects">{effects.map((effect) => <span key={`${effect.icon}-${effect.text}`}>{effect.icon} {effect.text}</span>)}</div>;
}

function getCardStyle(card) {
  const theme = CARD_THEME[card.lineage] || CARD_THEME.plant;
  return {
    "--card-base": theme.base,
    "--card-deep": theme.deep,
    "--card-glow": RARITY_GLOW[card.rarity] || theme.glow,
  };
}

function PlayerAvatar() {
  return <img className="character-image player-img" src={assetPath("player.png")} alt="플레이어" />;
}

function EnemyAvatar({ enemy }) {
  return <img className="character-image enemy-img" src={assetPath(enemy.image)} alt={enemy.name} />;
}

function PlayCard({ card, selected, order, onClick, fanIndex = 0, fanTotal = 1, reward = false }) {
  const mid = (fanTotal - 1) / 2;
  const rotate = reward ? 0 : (fanIndex - mid) * 4.5;
  const y = reward ? 0 : Math.abs(fanIndex - mid) * 5;
  const crowding = Math.max(0, fanTotal - 5);
  const cardScale = reward ? 1 : Math.max(0.84, 1 - crowding * 0.03);
  const overlap = reward ? 0 : Math.min(36, 14 + crowding * 4);
  return (
    <button className={`play-card ${selected ? "selected" : ""} ${reward ? "reward-card" : ""}`} style={{ ...getCardStyle(card), "--rotate": `${rotate}deg`, "--y": `${y}px`, "--card-scale": cardScale, "--card-overlap": `${overlap}px` }} onClick={onClick}>
      {order && <div className="order-badge">{order}</div>}
      <div className="card-top"><span className="cost">{card.cost}</span><strong>{card.name}</strong></div>
      <CardImageSlot card={card} />
      <div className="card-type">{card.type}</div>
      <CardEffects card={card} />
    </button>
  );
}

function SelectedComboBar({ selected, comboResult, selectedCost }) {
  if (selected.length === 0) {
    return (
      <div className="combo-panel empty">
        <div className="combo-title">현재 콤보 없음</div>
        <div className="combo-line">카드를 생물 구성 단계 순서대로 선택하세요.</div>
      </div>
    );
  }

  const comboTitle = comboResult.comboEntries.length > 0
    ? `${comboResult.comboEntries.map((combo) => `${LINEAGE_LABEL[combo.lineage] || combo.lineage} ${combo.length}콤보`).join(" + ")} 적용 중`
    : "콤보 적용 없음";

  return (
    <div className="combo-panel">
      <div className="combo-title">
        {comboTitle}
      </div>

      <div className="combo-chips">
        {selected.map((card, index) => (
          <React.Fragment key={card.uid}>
            <div className="combo-chip">
              <span className="combo-num">{index + 1}</span>
              <strong>{card.name}</strong>
              <em>{card.type}</em>
              <span>{card.lineage === "plant" ? "🌿" : "🧬"}</span>
            </div>
            {index < selected.length - 1 && <span className="combo-arrow">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="combo-summary">
        <span>예상 피해 <strong className="damage">{comboResult.totalDamage}</strong></span>
        <span>비용 <strong className="cost-text">{selectedCost}</strong></span>
      </div>
    </div>
  );
}

function HpBar({ current, max, align = "left" }) {
  return (
    <div className={`hud-row ${align}`}>
      <span className="hud-icon">♥</span>
      <div className="bar hp-bar"><div style={{ width: `${Math.max(0, Math.min(100, (current / max) * 100))}%` }} /></div>
      <strong>{Math.max(0, current)} / {max}</strong>
    </div>
  );
}

function BlockBar({ block }) {
  return (
    <div className="hud-row left block-row">
      <span className="hud-icon">🛡</span>
      <div className="bar block-bar"><div style={{ width: `${Math.min(100, block * 10)}%` }} /></div>
      <strong>{block}</strong>
    </div>
  );
}

export default function BioSpireLite() {
  const setup = useMemo(() => {
    const freshDeck = shuffle(STARTER_DECK);
    return drawCards(freshDeck, [], STARTING_HAND_SIZE);
  }, []);

  const [deck, setDeck] = useState(setup.deck);
  const [discard, setDiscard] = useState(setup.discard);
  const [hand, setHand] = useState(sortCardsByRarity(setup.drawn));
  const [selected, setSelected] = useState([]);
  const [energy, setEnergy] = useState(TURN_ENERGY_GAIN);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [block, setBlock] = useState(0);
  const [enemyIndex, setEnemyIndex] = useState(0);
  const [enemyHp, setEnemyHp] = useState(ENEMIES[0].hp);
  const [, setLog] = useState("카드를 순서대로 예약하고 카드 발동을 누르세요.");
  const [rewardMode, setRewardMode] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [turnWarning, setTurnWarning] = useState(null);
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [restartConfirm, setRestartConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [started, setStarted] = useState(false);
  const [attackFx, setAttackFx] = useState(null);

  const enemy = ENEMIES[enemyIndex];
  const comboResult = calculateComboDamage(selected);
  const comboLength = comboResult.bestLength;
  const selectedCost = selected.reduce((sum, card) => sum + (card.cost || 0), 0);
  const visibleHand = hand;

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
  }

  function triggerAttackFx(attacker) {
    setAttackFx(null);
    window.setTimeout(() => setAttackFx(attacker), 20);
    window.setTimeout(() => setAttackFx(null), 560);
  }

  function isSelected(card) {
    return selected.some((selectedCard) => selectedCard.uid === card.uid);
  }

  function selectCard(card) {
    if (gameOver || rewardMode) return;
    if (isSelected(card)) setSelected((previous) => previous.filter((selectedCard) => selectedCard.uid !== card.uid));
    else setSelected((previous) => [...previous, card]);
  }

  function getSelectedOrder(card) {
    const index = selected.findIndex((selectedCard) => selectedCard.uid === card.uid);
    return index >= 0 ? index + 1 : null;
  }

  function enemyAttackAndDraw(messagePrefix, force = false) {
    const warning = getTurnOverflowWarning(energy, hand.length);
    if (!force && warning) {
      setTurnWarning({ message: warning });
      return;
    }
    const damage = Math.max(0, enemy.intent - block);
    if (damage > 0) triggerAttackFx("enemy");
    const nextBlock = Math.max(0, block - enemy.intent);
    const nextPlayerHp = playerHp - damage;
    const drawResult = drawCards(deck, discard, TURN_DRAW_COUNT);
    const combinedHand = [...hand, ...drawResult.drawn];
    const nextHand = trimHand(combinedHand);
    const nextEnergy = Math.min(MAX_ENERGY, energy + TURN_ENERGY_GAIN);
    const lostCards = Math.max(0, combinedHand.length - MAX_HAND_SIZE);
    const lostEnergy = Math.max(0, energy + TURN_ENERGY_GAIN - MAX_ENERGY);
    setPlayerHp(nextPlayerHp);
    setBlock(nextBlock);
    setEnergy(nextEnergy);
    setSelected([]);
    setHand(sortCardsByRarity(nextHand));
    setDeck(drawResult.deck);
    setDiscard(drawResult.discard);
    setTurnWarning(null);
    setSkipConfirm(false);
    let nextLog = `${messagePrefix} 적의 공격으로 ${damage} 피해를 받았습니다. 남은 방어도는 ${nextBlock}입니다. 카드 ${drawResult.drawn.length}장을 드로우했습니다.`;
    if (lostCards > 0) nextLog += ` 손패 초과로 ${lostCards}장을 받지 못했습니다.`;
    if (lostEnergy > 0) nextLog += ` 에너지 초과로 ${lostEnergy}이 사라졌습니다.`;
    setLog(nextLog);
    if (nextPlayerHp <= 0) {
      setGameOver(true);
      setLog("패배했습니다. 다시 도전해보세요.");
    }
  }

  function playSelectedCards() {
    if (gameOver || rewardMode) return;
    if (selected.length === 0) {
      setLog("발동할 카드를 먼저 선택하세요. 카드를 사용하지 않으려면 턴 종료를 누르세요.");
      return;
    }

    if (selectedCost > energy) {
      showToast("에너지가 부족합니다.");
      return;
    }
    const totalDamage = comboResult.totalDamage;
    if (totalDamage > 0) triggerAttackFx("player");
    const totalBlock = selected.reduce((sum, card) => sum + (card.block || 0), 0);
    const gainedEnergy = selected.reduce((sum, card) => sum + (card.energy || 0), 0);
    const drawAmount = selected.reduce((sum, card) => sum + (card.draw || 0), 0);
    const nextEnemyHp = Math.max(0, enemyHp - totalDamage);
    const selectedIds = new Set(selected.map((card) => card.uid));
    let nextHand = hand.filter((card) => !selectedIds.has(card.uid));
    let nextDiscard = [...discard, ...selected];
    let nextDeck = [...deck];
    if (drawAmount > 0) {
      const drawResult = drawCards(nextDeck, nextDiscard, drawAmount);
      nextDeck = drawResult.deck;
      nextDiscard = drawResult.discard;
      nextHand = trimHand([...nextHand, ...drawResult.drawn]);
    }
    setEnemyHp(nextEnemyHp);
    setBlock((previous) => previous + totalBlock);
    setEnergy((previous) => Math.min(MAX_ENERGY, previous - selectedCost + gainedEnergy));
    setHand(sortCardsByRarity(nextHand));
    setDeck(nextDeck);
    setDiscard(nextDiscard);
    setSelected([]);
    let nextLog = `${comboName(comboLength, comboResult.mode, comboResult.comboEntries)}! ${totalDamage} 피해. 방어 +${totalBlock}`;
    if (gainedEnergy > 0) nextLog += `, 에너지 +${gainedEnergy}`;
    if (drawAmount > 0) nextLog += `, 카드 ${drawAmount}장 추가 드로우`;
    setLog(nextLog);
    if (nextEnemyHp <= 0) {
      if (enemyIndex === ENEMIES.length - 1) {
        setWin(true);
        setGameOver(true);
        setLog("승리! 생명체 구성 순서를 활용해 모든 적을 물리쳤습니다.");
      } else {
        setRewards(pickWeightedRewardCards(3));
        setRewardMode(true);
        setLog("전투 승리! 보상 카드 1장을 선택하세요.");
      }
    }
  }

  function pickReward(card) {
    const rewardCard = withUid(card);
    const nextEnemyIndex = enemyIndex + 1;
    const nextDeckPool = [...discard, ...hand, rewardCard];
    const drawResult = drawCards(deck, nextDeckPool, STARTING_HAND_SIZE);
    setEnemyIndex(nextEnemyIndex);
    setEnemyHp(ENEMIES[nextEnemyIndex].hp);
    setEnergy(TURN_ENERGY_GAIN);
    setBlock(0);
    setRewardMode(false);
    setRewards([]);
    setSelected([]);
    setHand(sortCardsByRarity(drawResult.drawn));
    setDeck(drawResult.deck);
    setDiscard(drawResult.discard);
    setTurnWarning(null);
    setSkipConfirm(false);
    setLog(`${card.name} 카드를 덱에 추가했습니다. 다음 전투를 카드 5장으로 시작합니다.`);
  }

  function resetGame() {
    const freshDeck = shuffle(STARTER_DECK);
    const firstDraw = drawCards(freshDeck, [], STARTING_HAND_SIZE);
    setDeck(firstDraw.deck);
    setDiscard(firstDraw.discard);
    setHand(sortCardsByRarity(firstDraw.drawn));
    setSelected([]);
    setEnergy(TURN_ENERGY_GAIN);
    setPlayerHp(PLAYER_MAX_HP);
    setBlock(0);
    setEnemyIndex(0);
    setEnemyHp(ENEMIES[0].hp);
    setLog("카드를 순서대로 예약하고 카드 발동을 누르세요.");
    setTurnWarning(null);
    setSkipConfirm(false);
    setRestartConfirm(false);
    setRewardMode(false);
    setRewards([]);
    setGameOver(false);
    setWin(false);
    setStarted(true);
    setAttackFx(null);
  }

  return (
    <div className="game">
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { width:100%; height:100%; margin:0; overflow:hidden; background:#030403; }
        body { margin:0; background:#030403; }
        .game { position:fixed; inset:0; width:100vw; height:100dvh; color:#f7f2df; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#030403; overflow:hidden; }
        .game::before { content:""; position:fixed; inset:0; background:linear-gradient(to right, rgba(0,0,0,.12), rgba(0,0,0,.45)), url('${assetPath("forest-bg.png")}'); background-size:cover; background-position:center; z-index:0; }
        .game::after { content:""; position:fixed; inset:0; background:linear-gradient(to left, rgba(0,0,0,.15), rgba(0,0,0,.62)), url('${assetPath("corruption-bg.png")}'); background-size:cover; background-position:center; clip-path:polygon(50% 0,100% 0,100% 100%,42% 100%); z-index:1; pointer-events:none; }
        .start-screen { position:fixed; inset:0; z-index:90; display:flex; align-items:center; justify-content:center; padding:24px; background:linear-gradient(90deg, rgba(3,8,4,.78), rgba(15,6,28,.82)); backdrop-filter:blur(3px); }
        .start-panel { width:min(620px, 92vw); text-align:center; padding:34px 30px 30px; border-radius:22px; border:1px solid rgba(255,225,154,.54); background:linear-gradient(180deg, rgba(9,18,12,.9), rgba(8,8,10,.94)); box-shadow:0 26px 70px rgba(0,0,0,.64), inset 0 0 30px rgba(255,231,150,.07); }
        .start-title { margin:0; color:#ffe9a7; font-size:clamp(32px, 4.2vw, 58px); line-height:1.05; font-weight:950; text-shadow:0 4px 12px rgba(0,0,0,.8), 0 0 24px rgba(255,206,92,.28); }
        .start-subtitle { margin:14px auto 0; max-width:520px; color:#efe3bd; font-size:clamp(15px, 1.35vw, 20px); line-height:1.55; font-weight:750; }
        .start-rules { display:grid; gap:12px; margin:24px 0; }
        .start-rule { padding:14px 16px; border-radius:12px; border:1px solid rgba(255,231,150,.26); background:rgba(0,0,0,.34); text-align:left; }
        .start-rule strong { display:block; margin-bottom:7px; color:#ffe9a7; font-size:clamp(15px, 1.25vw, 18px); font-weight:950; }
        .start-rule span { display:block; color:#fff2c9; font-size:clamp(14px, 1.1vw, 17px); font-weight:850; line-height:1.45; }
        .start-button { min-width:190px; min-height:52px; padding:12px 24px; border-radius:14px; border:1px solid rgba(255,232,164,.76); background:linear-gradient(180deg, #4e9a39, #123d1a); color:#fff8dc; font-size:20px; font-weight:950; cursor:pointer; touch-action:manipulation; box-shadow:0 0 24px rgba(114,255,83,.32), inset 0 0 16px rgba(255,255,255,.1); }
        .start-button:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .orientation-gate { display:none; position:fixed; inset:0; z-index:140; align-items:center; justify-content:center; padding:24px; background:linear-gradient(180deg, rgba(3,4,3,.94), rgba(12,8,22,.96)); text-align:center; }
        .orientation-panel { width:min(430px, 90vw); padding:28px 22px; border-radius:20px; border:1px solid rgba(255,225,154,.52); background:rgba(10,14,12,.86); box-shadow:0 24px 60px rgba(0,0,0,.7), inset 0 0 28px rgba(255,231,150,.06); }
        .orientation-icon { font-size:52px; line-height:1; margin-bottom:16px; }
        .orientation-panel h2 { margin:0; color:#ffe9a7; font-size:26px; font-weight:950; }
        .orientation-panel p { margin:12px 0 0; color:#f0e4bf; font-size:16px; line-height:1.55; font-weight:800; }
        .wrap { position:relative; z-index:2; width:100%; height:100%; display:grid; grid-template-rows:minmax(0, 1fr) clamp(160px, 26dvh, 230px); overflow:hidden; }
        .battle { position:relative; min-height:0; overflow:hidden; }
        .rift { position:absolute; left:50%; top:0; bottom:0; width:70px; transform:translateX(-50%); background:radial-gradient(circle at 50% 44%, rgba(255,200,69,.3), transparent 15%), linear-gradient(180deg, transparent 0%, rgba(179,255,120,.45) 24%, rgba(251,211,89,.85) 50%, rgba(174,67,255,.62) 76%, transparent 100%); filter:blur(.2px); opacity:.88; }
        .rift::before { content:""; position:absolute; left:30px; top:-20px; width:6px; height:110%; background:linear-gradient(180deg, transparent, #bafc77, #ffd66d, #b83dff, transparent); box-shadow:0 0 18px #fbdf72, 0 0 34px #8b2cff; transform:rotate(4deg); }
        .vs { position:absolute; left:50%; top:49%; transform:translate(-50%,-50%); font-size:clamp(42px, 5.6vw, 82px); font-family:Georgia,serif; font-weight:950; color:#ffe19a; text-shadow:0 3px 0 #6a2806, 0 0 22px rgba(255,182,69,.92); z-index:5; }
        .hud { position:absolute; top:clamp(16px, 3dvh, 34px); z-index:7; width:clamp(290px, 27vw, 430px); display:flex; flex-direction:column; gap:6px; }
        .player-hud { left:clamp(18px, 3.2vw, 64px); align-items:flex-start; }
        .enemy-hud { right:clamp(18px, 3.2vw, 64px); align-items:flex-end; }
        .hud-title { font-size:clamp(16px, 1.6vw, 26px); font-weight:950; color:#fff7db; text-shadow:0 3px 6px rgba(0,0,0,.88); }
        .hud-row { display:grid; grid-template-columns:22px minmax(0, 1fr) 76px; align-items:center; gap:8px; width:100%; color:#fff7db; font-size:clamp(13px, 1.1vw, 18px); font-weight:950; text-shadow:0 2px 4px rgba(0,0,0,.85); }
        .hud-row strong { width:76px; text-align:left; white-space:nowrap; }
        .hud-row.right strong { text-align:right; }
        .hud-icon { width:22px; text-align:center; }
        .bar { height:clamp(8px, 1dvh, 14px); border-radius:999px; overflow:hidden; background:rgba(0,0,0,.58); border:1px solid rgba(255,231,161,.24); box-shadow:inset 0 0 10px rgba(0,0,0,.7); }
        .bar > div { height:100%; border-radius:999px; transition:width .25s; }
        .hp-bar > div { background:linear-gradient(90deg, #b91c1c, #ff4545, #ff9a8a); box-shadow:0 0 10px rgba(255,62,62,.65); }
        .block-bar > div { background:linear-gradient(90deg, #155e75, #38bdf8, #bfdbfe); box-shadow:0 0 10px rgba(56,189,248,.55); }
        .fighter { --fighter-y:-50%; position:absolute; top:52%; bottom:auto; z-index:4; display:flex; flex-direction:column; align-items:center; transform:translateY(var(--fighter-y)); }
        .player-side { left:clamp(9%, 13vw, 16%); }
        .enemy-side { right:clamp(9%, 13vw, 16%); }
        .character-image { object-fit:contain; pointer-events:none; user-select:none; }
        .player-img { width:clamp(215px, 23vw, 380px); height:clamp(215px, 23vw, 380px); max-height:45dvh; filter:drop-shadow(0 24px 28px rgba(0,0,0,.65)) drop-shadow(0 0 28px rgba(120,255,92,.52)); animation:floatPlayer 2.8s ease-in-out infinite; }
        .enemy-img { width:clamp(205px, 22vw, 360px); height:clamp(205px, 22vw, 360px); max-height:45dvh; filter:drop-shadow(0 26px 26px rgba(0,0,0,.75)) drop-shadow(0 0 26px rgba(191,58,255,.72)); animation:enemyPulse 2.2s ease-in-out infinite; }
        .enemy-intent { margin-top:4px; padding:3px 9px; border-radius:999px; background:rgba(0,0,0,.55); border:1px solid rgba(255,120,120,.38); color:#ffe5e5; font-size:clamp(11px,.8vw,14px); font-weight:950; line-height:1.1; box-shadow:0 0 10px rgba(255,80,80,.22); }
        .player-side.attack-player { animation:playerStrike .52s ease-out; }
        .enemy-side.attack-enemy { animation:enemyStrike .52s ease-out; }
        .enemy-side.hit-enemy { animation:enemyHit .46s ease-out; }
        .player-side.hit-player { animation:playerHit .46s ease-out; }
        .hit-enemy .enemy-img, .hit-player .player-img { filter:brightness(1.35) drop-shadow(0 0 30px rgba(255,88,88,.95)); }
        @keyframes floatPlayer { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-8px); } }
        @keyframes enemyPulse { 0%,100%{ transform:translateY(0) scale(1); } 50%{ transform:translateY(-6px) scale(1.03); } }
        @keyframes playerStrike { 0%{ transform:translate(0,var(--fighter-y)) scale(1); } 45%{ transform:translate(72px,calc(var(--fighter-y) - 8px)) scale(1.08); } 100%{ transform:translate(0,var(--fighter-y)) scale(1); } }
        @keyframes enemyStrike { 0%{ transform:translate(0,var(--fighter-y)) scale(1); } 45%{ transform:translate(-72px,calc(var(--fighter-y) - 8px)) scale(1.08); } 100%{ transform:translate(0,var(--fighter-y)) scale(1); } }
        @keyframes enemyHit { 0%{ transform:translate(0,var(--fighter-y)) scale(1); } 20%{ transform:translate(14px,var(--fighter-y)) scale(1.04); } 42%{ transform:translate(-10px,var(--fighter-y)) scale(.98); } 68%{ transform:translate(6px,var(--fighter-y)) scale(1.02); } 100%{ transform:translate(0,var(--fighter-y)) scale(1); } }
        @keyframes playerHit { 0%{ transform:translate(0,var(--fighter-y)) scale(1); } 20%{ transform:translate(-14px,var(--fighter-y)) scale(1.04); } 42%{ transform:translate(10px,var(--fighter-y)) scale(.98); } 68%{ transform:translate(-6px,var(--fighter-y)) scale(1.02); } 100%{ transform:translate(0,var(--fighter-y)) scale(1); } }
        .bottom { position:relative; z-index:6; display:grid; grid-template-columns:clamp(82px, 8vw, 124px) minmax(0, 1fr) clamp(118px, 12vw, 180px); align-items:end; gap:clamp(6px, .9vw, 14px); padding:0 clamp(10px, 1.6vw, 24px) 30px; background:linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.35)); overflow:visible; }
        .energy-panel { align-self:end; display:flex; flex-direction:column; gap:6px; align-items:center; }
        .energy-orb { width:clamp(78px, 7.2vw, 116px); height:clamp(78px, 7.2vw, 116px); border-radius:999px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:radial-gradient(circle at 44% 35%, rgba(164,255,91,.95), rgba(32,94,39,.76) 42%, rgba(6,16,8,.95) 73%); border:2px solid rgba(212,190,109,.76); box-shadow:0 0 24px rgba(103,255,82,.48), inset 0 0 22px rgba(255,255,255,.12); font-weight:950; }
        .energy-number { font-size:clamp(24px, 2.4vw, 40px); line-height:1; }
        .energy-number small { font-size:clamp(13px, 1.1vw, 18px); }
        .energy-label { margin-top:4px; font-size:clamp(11px, .95vw, 15px); color:#f0e5b7; }
        .deck-mini { display:grid; gap:4px; width:100%; }
        .deck-mini span { padding:4px 8px; border-radius:8px; border:1px solid rgba(222,184,92,.28); background:rgba(0,0,0,.55); color:#e8d8aa; font-weight:900; font-size:clamp(11px, .9vw, 14px); text-align:center; }
        .hand-zone { min-width:0; align-self:end; position:relative; overflow:visible; }
        .combo-panel { position:absolute; left:50%; bottom:185px; transform:translateX(-50%); width:max-content; min-width:min(560px, 78vw); max-width:calc(100vw - 220px); padding:7px 14px; border-radius:12px; border:1px solid rgba(239,201,98,.42); background:rgba(0,0,0,.58); backdrop-filter:blur(6px); box-shadow:0 0 18px rgba(231,189,83,.16); text-align:center; z-index:20; }
        .combo-panel.empty { opacity:.72; }
        .combo-title { color:#ffe9a7; font-weight:950; font-size:clamp(13px, 1vw, 16px); margin-bottom:7px; }
        .combo-line { color:#d8cba2; font-size:13px; font-weight:800; }
        .combo-chips { display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap; }
        .combo-chip { display:flex; align-items:center; gap:6px; min-width:0; padding:4px 8px; border-radius:10px; background:rgba(8,15,10,.86); border:1px solid rgba(255,231,150,.28); color:#fff7dc; font-weight:900; white-space:nowrap; }
        .combo-chip strong { max-width:clamp(72px, 13vw, 180px); overflow:hidden; text-overflow:ellipsis; }
        .combo-chip em { font-style:normal; color:#d7c78e; font-size:12px; }
        .combo-num { width:22px; height:22px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; background:radial-gradient(circle, #d9efff, #2a78d4 60%, #06182e); border:1px solid #bfe8ff; color:white; font-weight:950; }
        .combo-arrow { color:#ffe9a7; font-size:18px; font-weight:950; }
        .combo-summary { display:flex; justify-content:center; gap:22px; margin-top:8px; color:#e9ddba; font-weight:900; }
        .combo-summary strong { margin-left:5px; font-size:16px; }
        .combo-summary .damage { color:#9BE15D; }
        .combo-summary .cost-text { color:#5BC6FF; }
        .cards { height:clamp(112px, 17dvh, 164px); display:flex; justify-content:center; align-items:flex-end; max-width:100%; padding:0 4px; overflow:visible; min-width:0; margin-top:20px; }
        .play-card { position:relative; width:calc(clamp(104px, 8.6vw, 154px) * var(--card-scale, 1)); height:calc(clamp(132px, 18.5dvh, 198px) * var(--card-scale, 1)); flex:0 0 calc(clamp(104px, 8.6vw, 154px) * var(--card-scale, 1)); margin-left:calc(var(--card-overlap, 18px) * -1); border:2px solid rgba(234,212,132,.5); border-radius:16px; padding:calc(clamp(7px, .65vw, 10px) * var(--card-scale, 1)); color:#fff8df; cursor:pointer; text-align:center; touch-action:manipulation; background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.18)), radial-gradient(circle at 50% 30%, var(--card-base), transparent 30%), linear-gradient(180deg, var(--card-deep), #030604 88%); box-shadow:0 10px 20px rgba(0,0,0,.58), 0 0 18px var(--card-glow), inset 0 0 14px rgba(255,255,255,.08); transform:translateY(var(--y)) rotate(var(--rotate)); transform-origin:50% 100%; transition:transform .16s, filter .16s, margin .16s, width .16s, height .16s, flex-basis .16s; }
        .play-card:first-child { margin-left:0; }
        .play-card::before { content:""; position:absolute; inset:5px; border:1px solid rgba(255,232,158,.25); border-radius:12px; pointer-events:none; }
        @media (hover:hover) and (pointer:fine) {
          .play-card:hover { z-index:30; transform:translateY(-18px) rotate(0deg) scale(1.045); margin-left:-4px; margin-right:10px; filter:brightness(1.12); }
        }
        .play-card:active { z-index:30; transform:translateY(-10px) rotate(0deg) scale(1.03); filter:brightness(1.1); }
        .play-card.selected { outline:3px solid #ffe58a; z-index:28; }
        .card-top { display:flex; align-items:center; gap:6px; min-width:0; }
        .card-top strong { font-size:clamp(12px, 1vw, 16px); font-weight:950; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-shadow:0 2px 5px rgba(0,0,0,.8); }
        .cost { width:clamp(23px, 2vw, 32px); height:clamp(23px, 2vw, 32px); border-radius:999px; flex:0 0 auto; display:inline-flex; align-items:center; justify-content:center; background:radial-gradient(circle, #eaf8ff, #2a8ecc 55%, #07131d 100%); border:2px solid #bfe8ff; color:white; font-size:clamp(14px, 1.25vw, 20px); font-weight:950; box-shadow:0 0 12px rgba(77,190,255,.8); }
        .card-art { height:clamp(44px, 7dvh, 76px); margin:clamp(5px, .7dvh, 8px) 0 5px; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:radial-gradient(circle, rgba(255,255,255,.15), rgba(0,0,0,.45)); border:1px solid rgba(255,231,159,.18); }
        .card-art span { font-size:clamp(24px, 2.3vw, 38px); line-height:1; }
        .card-art em, .card-type { font-style:normal; font-size:clamp(10px, .8vw, 12px); color:#e6d7a4; font-weight:800; }
        .effects { display:flex; gap:6px; justify-content:center; margin-top:clamp(5px, .7dvh, 8px); font-weight:950; color:#fff4c8; font-size:clamp(11px, .9vw, 14px); }
        .order-badge { position:absolute; top:-8px; right:-7px; width:28px; height:28px; border-radius:999px; display:flex; align-items:center; justify-content:center; background:#ffe58a; color:#241604; font-size:16px; font-weight:950; box-shadow:0 0 16px rgba(255,229,138,.8); z-index:5; }
        .action-panel { align-self:end; display:flex; flex-direction:column; gap:clamp(6px, .9dvh, 10px); align-items:stretch; }
        .button { border:none; min-height:clamp(34px, 4.9dvh, 48px); padding:clamp(7px, .9dvh, 11px) clamp(10px, 1vw, 16px); border-radius:12px; background:linear-gradient(180deg, #377632, #123c19); color:#fff7dc; font-size:clamp(13px, 1.2vw, 18px); font-weight:950; cursor:pointer; touch-action:manipulation; border:1px solid rgba(229,199,113,.62); box-shadow:0 0 16px rgba(106,255,73,.24), inset 0 0 14px rgba(255,255,255,.08); }
        .button.secondary { background:linear-gradient(180deg, #1f2630, #07090d); }
        .button.danger { background:linear-gradient(180deg, #783434, #331010); }
        .button:disabled { opacity:.45; cursor:not-allowed; }
        .toast { position:fixed; left:50%; top:30px; transform:translateX(-50%); z-index:80; background:#7a1212; color:white; padding:10px 16px; border-radius:999px; font-weight:950; box-shadow:0 14px 26px rgba(0,0,0,.5); }
        .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.72); display:flex; align-items:center; justify-content:center; padding:20px; z-index:50; }
        .modal { width:min(800px, 100%); padding:28px; border-radius:24px; border:1px solid rgba(229,199,113,.58); background:linear-gradient(180deg, rgba(21,20,14,.96), rgba(5,5,5,.98)); box-shadow:0 24px 60px rgba(0,0,0,.72), inset 0 0 24px rgba(255,220,122,.06); }
        .modal h2 { margin:0; text-align:center; color:#ffe9a7; font-size:32px; }
        .reward-grid { display:flex; justify-content:center; gap:18px; margin-top:22px; flex-wrap:wrap; }
        .reward-card { margin-left:0; transform:none; }
        .confirm-message, .warning-message { color:#f2e6c9; font-size:17px; text-align:center; line-height:1.6; }
        .warning-message { color:#ffb6b6; font-weight:900; }
        .center { display:flex; justify-content:center; gap:12px; margin-top:18px; }
        @media (max-height:760px), (max-width:1100px) {
          .wrap { grid-template-rows:minmax(0, 1fr) 190px; }
          .hud { top:12px; width:300px; }
          .player-img { width:225px; height:225px; max-height:37dvh; }
          .enemy-img { width:225px; height:225px; max-height:37dvh; }
          .fighter { top:52%; bottom:auto; }
          .enemy-side { right:11%; bottom:auto; }
          .enemy-intent { font-size:11px; padding:3px 8px; margin-top:3px; }
          .cards { height:118px; }
          .play-card { width:calc(102px * var(--card-scale, 1)); height:calc(132px * var(--card-scale, 1)); flex-basis:calc(102px * var(--card-scale, 1)); }
          .card-art { height:42px; }
          .effects { font-size:11px; }
          .card-top strong { font-size:12px; }
          .energy-orb { width:74px; height:74px; }
          .button { min-height:36px; font-size:13px; }
        }
        @media (max-width:760px) {
          .start-screen { padding:14px; align-items:center; }
          .start-panel { width:96vw; padding:22px 16px 18px; border-radius:16px; }
          .start-title { font-size:28px; }
          .start-subtitle { font-size:14px; line-height:1.4; }
          .start-rules { gap:8px; margin:16px 0; }
          .start-rule { padding:10px 12px; }
          .start-rule strong { font-size:14px; margin-bottom:4px; }
          .start-rule span { font-size:13px; }
          .start-button { min-height:46px; font-size:17px; }
          .wrap { grid-template-rows:minmax(0, 1fr) 172px; }
          .hud { top:10px; width:clamp(150px, 42vw, 220px); }
          .hud-title { font-size:15px; }
          .hud-row { grid-template-columns:18px minmax(0, 1fr) 54px; gap:5px; font-size:12px; }
          .hud-row strong { width:54px; }
          .vs { font-size:40px; }
          .fighter { top:52%; bottom:auto; }
          .enemy-side { right:6%; bottom:auto; }
          .player-side { left:6%; }
          .player-img, .enemy-img { width:150px; height:150px; max-height:32dvh; }
          .bottom { grid-template-columns:62px minmax(0, 1fr) 88px; gap:6px; padding:0 7px 20px; }
          .energy-orb { width:58px; height:58px; }
          .energy-number { font-size:22px; }
          .energy-label { font-size:10px; }
          .deck-mini span { padding:3px 4px; font-size:10px; }
          .combo-panel { bottom:132px; min-width:min(320px, 78vw); max-width:calc(100vw - 16px); padding:6px 8px; }
          .combo-title { font-size:12px; margin-bottom:5px; }
          .combo-line { font-size:11px; }
          .combo-chips { gap:4px; }
          .combo-chip { gap:4px; padding:3px 6px; font-size:11px; }
          .combo-chip strong { max-width:82px; }
          .combo-chip em { font-size:10px; }
          .combo-num { width:18px; height:18px; }
          .combo-summary { gap:12px; margin-top:5px; font-size:12px; }
          .cards { height:108px; margin-top:8px; justify-content:center; }
          .play-card { width:calc(72px * var(--card-scale, 1)); height:calc(106px * var(--card-scale, 1)); flex-basis:calc(72px * var(--card-scale, 1)); margin-left:calc(var(--card-overlap, 17px) * -1); border-radius:12px; padding:calc(5px * var(--card-scale, 1)); }
          .play-card:first-child { margin-left:0; }
          .card-top { gap:3px; }
          .card-top strong { font-size:10px; }
          .cost { width:19px; height:19px; font-size:11px; border-width:1px; }
          .card-art { height:34px; margin:4px 0; }
          .card-art span { font-size:20px; }
          .card-art em, .card-type { font-size:9px; }
          .effects { gap:3px; font-size:10px; margin-top:4px; }
          .order-badge { width:22px; height:22px; font-size:13px; top:-7px; right:-6px; }
          .action-panel { gap:6px; }
          .button { min-height:34px; padding:6px 7px; border-radius:9px; font-size:12px; }
          .modal { padding:20px 16px; border-radius:18px; }
          .modal h2 { font-size:24px; }
        }
        @media (max-width:1100px) and (orientation:landscape) {
          .wrap { grid-template-rows:minmax(0, 1fr) clamp(158px, 27dvh, 190px); }
          .fighter { --fighter-y:0px; top:auto; bottom:clamp(8px, 2dvh, 18px); }
          .enemy-side { bottom:clamp(8px, 2dvh, 18px); }
          .player-img, .enemy-img { width:clamp(104px, min(16vw, 30dvh), 178px); height:clamp(104px, min(16vw, 30dvh), 178px); max-height:30dvh; }
          .enemy-intent { margin-top:2px; }
          .combo-panel { bottom:clamp(122px, 22dvh, 156px); }
        }
        @media (max-height:520px) and (orientation:landscape) {
          .fighter { --fighter-y:0px; top:auto; bottom:6px; }
          .enemy-side { bottom:6px; }
          .player-img, .enemy-img { width:clamp(84px, min(13vw, 22dvh), 125px); height:clamp(84px, min(13vw, 22dvh), 125px); max-height:22dvh; }
          .combo-panel { bottom:116px; }
        }
        @media (max-width:1100px) and (orientation:portrait) {
          .orientation-gate { display:flex; }
        }
      `}</style>

      {toast && <div className="toast">{toast}</div>}
      <div className="orientation-gate">
        <div className="orientation-panel">
          <div className="orientation-icon">↻</div>
          <h2>가로 모드로 돌려주세요</h2>
          <p>이 게임은 카드와 콤보를 한눈에 보기 위해 패드와 핸드폰에서 가로 화면으로 플레이하도록 만들었습니다.</p>
        </div>
      </div>
      {!started && (
        <div className="start-screen">
          <div className="start-panel">
            <h1 className="start-title">생물 구성 단계 배틀</h1>
            <p className="start-subtitle">같은 계열 카드를 생물 구성 단계 순서대로 연결하면 콤보 피해가 커집니다.</p>
            <div className="start-rules">
              <div className="start-rule">
                <strong>동물 콤보</strong>
                <span>세포 → 조직 → 기관 → 기관계 → 개체</span>
              </div>
              <div className="start-rule">
                <strong>식물 콤보</strong>
                <span>세포 → 조직 → 조직계 → 기관 → 개체</span>
              </div>
              <div className="start-rule">
                <strong>혼합 콤보</strong>
                <span>동물끼리, 식물끼리 연속해서 선택하면 두 콤보가 함께 적용됩니다.</span>
              </div>
            </div>
            <button className="start-button" onClick={resetGame}>게임 시작</button>
          </div>
        </div>
      )}
      <div className="wrap">
        <section className="battle">
          <div className="rift" />
          <div className="hud player-hud">
            <div className="hud-title">플레이어</div>
            <HpBar current={playerHp} max={PLAYER_MAX_HP} />
            <BlockBar block={block} />
          </div>
          <div className="hud enemy-hud">
            <div className="hud-title">{enemy.name}</div>
            <HpBar current={enemyHp} max={enemy.hp} align="right" />
          </div>
          <div className={`fighter player-side ${attackFx === "player" ? "attack-player" : ""} ${attackFx === "enemy" ? "hit-player" : ""}`}><PlayerAvatar /></div>
          <div className={`fighter enemy-side ${attackFx === "enemy" ? "attack-enemy" : ""} ${attackFx === "player" ? "hit-enemy" : ""}`}><EnemyAvatar enemy={enemy} /><div className="enemy-intent">공격 {enemy.intent}</div></div>
          <div className="vs">VS</div>
        </section>

        <section className="bottom">
          <div className="energy-panel">
            <div className="energy-orb"><div className="energy-number">{energy}<small>/{MAX_ENERGY}</small></div><div className="energy-label">에너지</div></div>
            <div className="deck-mini"><span>덱 {deck.length}</span><span>버림 {discard.length}</span></div>
          </div>
          <div className="hand-zone">
            <SelectedComboBar selected={selected} comboResult={comboResult} selectedCost={selectedCost} />
            <div className="cards">
              {visibleHand.map((card, idx) => (
                <PlayCard
                  key={card.uid}
                  card={card}
                  selected={isSelected(card)}
                  order={getSelectedOrder(card)}
                  fanIndex={idx}
                  fanTotal={visibleHand.length}
                  onClick={() => selectCard(card)}
                />
              ))}
            </div>
          </div>
          <div className="action-panel">
            <button className="button" onClick={playSelectedCards} disabled={gameOver || rewardMode}>카드 발동</button>
            <button className="button danger" onClick={() => setSkipConfirm(true)} disabled={gameOver || rewardMode}>턴 종료</button>
            <button className="button secondary" onClick={() => setSelected([])} disabled={gameOver || rewardMode}>예약 취소</button>
            <button className="button secondary restart-button" onClick={() => setRestartConfirm(true)}>처음부터</button>
          </div>
        </section>
      </div>

      {rewardMode && (
        <div className="modal-bg"><div className="modal"><h2>보상 카드 선택</h2><div className="reward-grid">
          {rewards.map((card) => <PlayCard key={card.uid} card={card} reward onClick={() => pickReward(card)} />)}
        </div></div></div>
      )}

      {skipConfirm && !gameOver && (
        <div className="modal-bg"><div className="modal" style={{ maxWidth: 560 }}><h2>턴을 종료하시겠습니까?</h2><p className="confirm-message">적이 공격하고, 다음 턴에 카드 2장을 드로우합니다.</p><div className="center"><button className="button danger" onClick={() => enemyAttackAndDraw("턴을 넘겼습니다.")}>종료</button><button className="button secondary" onClick={() => setSkipConfirm(false)}>취소</button></div></div></div>
      )}

      {turnWarning && !gameOver && (
        <div className="modal-bg"><div className="modal" style={{ maxWidth: 580 }}><h2>자원이 최대치를 넘습니다</h2><p className="warning-message">{turnWarning.message}</p><div className="center"><button className="button danger" onClick={() => enemyAttackAndDraw("초과를 감수하고 턴을 넘겼습니다.", true)}>그래도 종료</button><button className="button secondary" onClick={() => setTurnWarning(null)}>취소</button></div></div></div>
      )}

      {restartConfirm && !gameOver && (
        <div className="modal-bg"><div className="modal" style={{ maxWidth: 560 }}><h2>처음부터 다시 시작할까요?</h2><p className="confirm-message">현재 전투와 보상 진행이 초기화되고, 시작 덱을 새로 섞어 다시 시작합니다.</p><div className="center"><button className="button danger" onClick={resetGame}>다시 시작</button><button className="button secondary" onClick={() => setRestartConfirm(false)}>취소</button></div></div></div>
      )}

      {gameOver && (
        <div className="modal-bg"><div className="modal" style={{ maxWidth: 520, textAlign: "center" }}><div style={{ fontSize: 54 }}>{win ? "🏆" : "🧬"}</div><h2>{win ? "승리!" : "패배"}</h2><p className="confirm-message">{win ? "생명체 구성 순서를 활용해 적을 물리쳤습니다." : "다시 도전해보세요."}</p><button className="button" onClick={resetGame}>다시 도전</button></div></div>
      )}
    </div>
  );
}
