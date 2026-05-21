import React, { useMemo, useState } from "react";

const STARTING_HAND_SIZE = 5;
const TURN_DRAW_COUNT = 3;
const TURN_ENERGY_GAIN = 7;
const MAX_ENERGY = 20;
const MAX_HAND_SIZE = 12;
const PLAYER_MAX_HP = 70;
const HARD_MODE_INTENT_MULTIPLIER = 1.5;

function assetPath(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

const STARTER_DECK = [
  { id: "animal-cell-1", name: "상피세포", type: "세포", lineage: "animal", rarity: "common", cost: 1, attack: 4, block: 0, desc: "피해 4", image: "cards/epithelial-cell.png" },
  { id: "animal-cell-2", name: "근육세포", type: "세포", lineage: "animal", rarity: "common", cost: 1, attack: 5, block: 0, desc: "피해 5", image: "cards/muscle-cell.png" },
  { id: "animal-tissue-1", name: "상피조직", type: "조직", lineage: "animal", rarity: "common", cost: 1, attack: 0, block: 6, desc: "방어 6", image: "cards/epithelial-tissue.png" },
  { id: "animal-organ-1", name: "위", type: "기관", lineage: "animal", rarity: "rare", cost: 2, attack: 7, block: 3, desc: "피해 7, 방어 3", image: "cards/stomach.png" },
  { id: "animal-system-1", name: "소화계", type: "기관계", lineage: "animal", rarity: "rare", cost: 2, attack: 4, block: 4, energy: 1, desc: "피해 4, 방어 4, 에너지 +1", image: "cards/digestive-system.png" },
  { id: "animal-body-1", name: "사람", type: "개체", lineage: "animal", rarity: "legendary", cost: 3, attack: 12, block: 0, desc: "피해 12", image: "cards/human-body.png" },
  { id: "animal-cell-nerve", name: "신경세포", type: "세포", lineage: "animal", rarity: "common", cost: 1, attack: 3, block: 0, draw: 1, desc: "피해 3, 카드 1장 드로우", image: "cards/nerve-cell.png" },
  { id: "animal-tissue-connective", name: "결합조직", type: "조직", lineage: "animal", rarity: "common", cost: 1, attack: 0, block: 7, desc: "방어 7", image: "cards/connective-tissue.png" },
  { id: "animal-organ-small-intestine", name: "소장", type: "기관", lineage: "animal", rarity: "rare", cost: 2, attack: 8, block: 2, desc: "피해 8, 방어 2", image: "cards/small-intestine.png" },
  { id: "animal-system-circulatory", name: "순환계", type: "기관계", lineage: "animal", rarity: "rare", cost: 2, attack: 5, block: 0, energy: 1, desc: "피해 5, 에너지 +1", image: "cards/circulatory-system.png" },
  { id: "animal-body-enhanced-human", name: "사람 강화형", type: "개체", lineage: "animal", rarity: "legendary", cost: 3, attack: 10, block: 3, desc: "피해 10, 방어 3", image: "cards/enhanced-human.png" },
  { id: "animal-tissue-nerve", name: "신경조직", type: "조직", lineage: "animal", rarity: "rare", cost: 1, attack: 3, block: 0, draw: 1, desc: "피해 3, 카드 1장 드로우", image: "cards/nerve-tissue.png" },
  { id: "plant-cell-1", name: "표피세포", type: "세포", lineage: "plant", rarity: "common", cost: 1, attack: 3, block: 0, desc: "피해 3", image: "cards/plant-epidermal-cell.png" },
  { id: "plant-cell-2", name: "공변세포", type: "세포", lineage: "plant", rarity: "rare", cost: 1, attack: 2, block: 0, energy: 1, desc: "피해 2, 에너지 +1", image: "cards/guard-cell.png" },
  { id: "plant-tissue-1", name: "표피조직", type: "조직", lineage: "plant", rarity: "common", cost: 1, attack: 0, block: 5, desc: "방어 5", image: "cards/plant-epidermal-tissue.png" },
  { id: "plant-system-1", name: "표피조직계", type: "조직계", lineage: "plant", rarity: "rare", cost: 2, attack: 4, block: 4, desc: "피해 4, 방어 4", image: "cards/plant-tissue-system.png" },
  { id: "plant-system-2", name: "관다발조직계", type: "조직계", lineage: "plant", rarity: "rare", cost: 2, attack: 5, block: 3, draw: 1, desc: "피해 5, 방어 3, 카드 1장 드로우", image: "cards/vascular-bundle-system.png" },
  { id: "plant-organ-1", name: "잎", type: "기관", lineage: "plant", rarity: "rare", cost: 2, attack: 6, block: 0, desc: "피해 6", image: "cards/leaf.png" },
  { id: "plant-body-1", name: "나무", type: "개체", lineage: "plant", rarity: "legendary", cost: 3, attack: 11, block: 0, desc: "피해 11", image: "cards/tree.png" },
  { id: "plant-cell-xylem", name: "물관세포", type: "세포", lineage: "plant", rarity: "common", cost: 1, attack: 2, block: 0, energy: 1, desc: "피해 2, 에너지 +1", image: "cards/xylem-cell.png" },
  { id: "plant-tissue-palisade", name: "울타리조직", type: "조직", lineage: "plant", rarity: "common", cost: 1, attack: 4, block: 3, desc: "피해 4, 방어 3", image: "cards/palisade-tissue.png" },
  { id: "plant-system-xylem", name: "물관", type: "조직계", lineage: "plant", rarity: "rare", cost: 2, attack: 5, block: 4, desc: "피해 5, 방어 4", image: "cards/xylem.png" },
  { id: "plant-organ-flower", name: "꽃", type: "기관", lineage: "plant", rarity: "rare", cost: 2, attack: 7, block: 0, draw: 1, desc: "피해 7, 카드 1장 드로우", image: "cards/flower.png" },
  { id: "plant-body-grass", name: "풀", type: "개체", lineage: "plant", rarity: "legendary", cost: 3, attack: 9, block: 4, desc: "피해 9, 방어 4", image: "cards/grass.png" },
];

const REWARD_CARDS = [
  { id: "animal-organ-lung", name: "폐", type: "기관", lineage: "animal", rarity: "rare", cost: 2, attack: 9, block: 2, desc: "피해 9, 방어 2", image: "cards/lung.png" },
  { id: "animal-organ-heart", name: "심장", type: "기관", lineage: "animal", rarity: "rare", cost: 1, attack: 3, block: 7, desc: "피해 3, 방어 7", image: "cards/heart.png" },
  { id: "animal-system-resp", name: "호흡계", type: "기관계", lineage: "animal", rarity: "rare", cost: 2, attack: 6, block: 3, draw: 1, desc: "피해 6, 방어 3, 카드 1장 드로우", image: "cards/respiratory-system.png" },
  { id: "animal-body-human-strong", name: "강화된 사람", type: "개체", lineage: "animal", rarity: "legendary", cost: 4, attack: 18, block: 0, desc: "피해 18", image: "cards/strengthened-human.png" },
  { id: "animal-tissue-bone", name: "뼈조직", type: "조직", lineage: "animal", rarity: "rare", cost: 2, attack: 1, block: 12, desc: "피해 1, 방어 12", image: "cards/bone-tissue.png" },
  { id: "plant-organ-root", name: "뿌리", type: "기관", lineage: "plant", rarity: "common", cost: 1, attack: 2, block: 8, desc: "피해 2, 방어 8", image: "cards/root.png" },
  { id: "plant-organ-stem", name: "줄기", type: "기관", lineage: "plant", rarity: "rare", cost: 1, attack: 5, block: 3, energy: 1, desc: "피해 5, 방어 3, 에너지 +1", image: "cards/stem.png" },
  { id: "plant-body-sunflower", name: "해바라기", type: "개체", lineage: "plant", rarity: "legendary", cost: 2, attack: 10, block: 2, desc: "피해 10, 방어 2", image: "cards/sunflower.png" },
  { id: "plant-system-vascular-plus", name: "강화 관다발조직계", type: "조직계", lineage: "plant", rarity: "legendary", cost: 3, attack: 8, block: 5, draw: 1, desc: "피해 8, 방어 5, 카드 1장 드로우", image: "cards/strengthened-vascular-bundle-system.png" },
  { id: "plant-tissue-thick-epidermal", name: "두꺼운 표피조직", type: "조직", lineage: "plant", rarity: "rare", cost: 2, attack: 1, block: 12, desc: "피해 1, 방어 12", image: "cards/thick-epidermal-tissue.png" },
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
const CARD_FILTERS = ["전체", "세포", "조직", "조직계", "기관", "기관계", "개체"];
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

function withoutUid(card) {
  const baseCard = { ...card };
  delete baseCard.uid;
  return baseCard;
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

function getCardPool(...cardGroups) {
  return cardGroups.flat().map(withoutUid);
}

function startBattleFromPool(cardPool, handSize = STARTING_HAND_SIZE) {
  const shuffledDeck = shuffle(cardPool);
  const drawResult = drawCards(shuffledDeck, [], handSize);
  return {
    hand: sortCardsByRarity(drawResult.drawn),
    deck: drawResult.deck,
    discard: drawResult.discard,
  };
}

function summarizeCards(cards) {
  const summary = new Map();
  for (const card of cards) {
    const current = summary.get(card.id);
    if (current) current.count += 1;
    else summary.set(card.id, { ...withoutUid(card), count: 1 });
  }
  return sortCardsByRarity([...summary.values()]);
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
  if (card.image) {
    return (
      <div className="card-art image-art">
        <img src={assetPath(card.image)} alt="" />
      </div>
    );
  }
  return (
    <div className="card-art">
      <span>{icon}</span>
      <em>{card.type}</em>
    </div>
  );
}

function CardEffects({ card }) {
  const effects = [
    card.attack ? { icon: "⚔", label: "피해", text: card.attack } : null,
    card.block ? { icon: "🛡", label: "방어", text: card.block } : null,
    card.energy ? { icon: "⚡", label: "에너지 회복", text: `+${card.energy}` } : null,
    card.draw ? { icon: "🃏", label: "카드 드로우", text: `+${card.draw}` } : null,
  ].filter(Boolean);
  return <div className="effects">{effects.map((effect) => <span key={`${effect.icon}-${effect.text}`} title={effect.label} aria-label={`${effect.label} ${effect.text}`}>{effect.icon} {effect.text}</span>)}</div>;
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

function CardLibraryModal({ cards, rewardCards, onClose }) {
  const [activeCategory, setActiveCategory] = useState("owned");
  const [activeFilter, setActiveFilter] = useState("전체");
  const ownedCardMap = new Map(cards.map((card) => [card.id, card]));
  const rewardLibraryCards = rewardCards.map((card) => {
    const ownedCard = ownedCardMap.get(card.id);
    return ownedCard ? { ...card, count: ownedCard.count, acquired: true } : { ...card, acquired: false };
  });
  const activeCards = activeCategory === "owned" ? cards : rewardLibraryCards;
  const totalCards = activeCards.reduce((sum, card) => sum + (card.count || 1), 0);
  const averageCost = activeCards.length
    ? (activeCards.reduce((sum, card) => sum + card.cost * (card.count || 1), 0) / totalCards).toFixed(1)
    : "0.0";
  const acquiredRewardCount = rewardLibraryCards.filter((card) => card.acquired).length;
  const visibleFilters = activeCategory === "owned" ? CARD_FILTERS : ["전체"];
  const filteredCards = activeFilter === "전체" ? activeCards : activeCards.filter((card) => card.type === activeFilter);
  function changeCategory(category) {
    setActiveCategory(category);
    setActiveFilter("전체");
  }

  return (
    <div className="modal-bg">
      <div className="modal card-library-modal">
        <div className="library-header">
          <h2>내 카드</h2>
          <div className="library-tabs">
            <button className={activeCategory === "owned" ? "active" : ""} onClick={() => changeCategory("owned")}>보유 카드</button>
            <button className={activeCategory === "rewards" ? "active" : ""} onClick={() => changeCategory("rewards")}>보상 카드</button>
          </div>
        </div>
        <div className="library-layout">
          <aside className="library-sidebar">
            <div className="library-deck-title">
              <span>{activeCategory === "owned" ? "🧬" : "★"}</span>
              <strong>{activeCategory === "owned" ? "생물 덱" : "보상 목록"}</strong>
            </div>
            <div className="library-stat"><b>{totalCards}</b><span>{activeCategory === "owned" ? "카드 수" : "보상 카드"}</span></div>
            {activeCategory === "rewards" && <div className="library-stat"><b>{acquiredRewardCount}/{rewardLibraryCards.length}</b><span>획득</span></div>}
            <div className="library-stat"><b>{averageCost}</b><span>평균 코스트</span></div>
            <div className="library-menu">
              {visibleFilters.map((filter) => (
                <button key={filter} className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)}>
                  {filter}
                </button>
              ))}
            </div>
          </aside>
          <div className="card-library">
            {filteredCards.map((card) => (
              <div className={`library-card ${card.rarity} ${activeCategory === "rewards" && !card.acquired ? "locked-reward" : ""}`} key={card.id} style={getCardStyle(card)}>
                <span className="library-cost">{card.cost}</span>
                {card.count > 1 && <em>x{card.count}</em>}
                {activeCategory === "rewards" && <span className={`reward-state ${card.acquired ? "acquired" : ""}`}>{card.acquired ? "획득" : "미획득"}</span>}
                <CardImageSlot card={card} />
                <div className="library-card-main">
                  <strong>{card.name}</strong>
                  <span>{LINEAGE_LABEL[card.lineage]} · {card.type}</span>
                </div>
                <CardEffects card={card} />
              </div>
            ))}
          </div>
        </div>
        <div className="center"><button className="button" onClick={onClose}>닫기</button></div>
      </div>
    </div>
  );
}

const TUTORIAL_STEPS = [
  {
    target: "player",
    title: "플레이어 정보",
    body: "현재 체력과 방어도를 확인합니다. 체력이 0이 되면 패배합니다.",
    position: "tutorial-player-note",
    spotlight: "spotlight-player",
  },
  {
    target: "energy",
    title: "에너지와 덱",
    body: "카드를 발동하려면 에너지가 필요합니다. 덱 숫자는 앞으로 뽑을 수 있는 카드 수입니다.",
    position: "tutorial-energy-note",
    spotlight: "spotlight-energy",
  },
  {
    target: "hand",
    title: "카드 선택",
    body: "손패 카드를 누르면 순서대로 예약됩니다. 선택한 카드를 다시 누르면 선택이 해제됩니다.",
    position: "tutorial-hand-note",
    spotlight: "spotlight-hand",
  },
  {
    target: "hand",
    title: "카드 효과",
    body: "⚔ 피해: 적 체력을 줄입니다. 🛡 방어: 적 공격을 막습니다. ⚡ 에너지: 사용 후 회복합니다. 🃏 드로우: 카드를 추가로 뽑습니다.",
    position: "tutorial-hand-note",
    spotlight: "spotlight-hand",
  },
  {
    target: "combo",
    title: "콤보 표시",
    body: "동물과 식물 카드를 구성 단계 순서대로 연결하면 콤보 피해가 증가합니다.",
    position: "tutorial-combo-note",
    spotlight: "spotlight-combo",
  },
  {
    target: "actions",
    title: "행동 버튼",
    body: "카드 발동으로 공격하고, 턴 종료로 적의 공격을 받습니다. 내 카드 버튼으로 보유 카드를 확인합니다.",
    position: "tutorial-actions-note",
    spotlight: "spotlight-actions",
  },
  {
    target: "enemy",
    title: "적 정보",
    body: "적의 체력을 확인합니다. 적을 모두 물리치면 다음 단계로 넘어갑니다.",
    position: "tutorial-enemy-note",
    spotlight: "spotlight-enemy",
  },
];

function TutorialDemoScreen() {
  const demoCards = [
    { cost: 1, name: "근육세포", icon: "🧬", type: "세포", sub: "세포", effects: "⚔ 5" },
    { cost: 1, name: "상피세포", icon: "🧬", type: "세포", sub: "세포", effects: "⚔ 4" },
    { cost: 1, name: "상피조직", icon: "🧬", type: "조직", sub: "조직", effects: "🛡 6" },
    { cost: 2, name: "위", icon: "🧬", type: "기관", sub: "기관", effects: "⚔ 7 🛡 3" },
    { cost: 3, name: "나무", icon: "🌿", type: "개체", sub: "개체", effects: "⚔ 11" },
  ];

  const demoPlayCards = demoCards.map((_, index) => {
    const demoIds = ["animal-cell-2", "animal-cell-1", "animal-tissue-1", "animal-organ-1", "plant-body-1"];
    const sourceCard = STARTER_DECK.find((card) => card.id === demoIds[index]) || STARTER_DECK[index];
    return withUid(sourceCard, index);
  });

  return (
    <div className="tutorial-demo-screen" aria-hidden="true">
      <div className="tutorial-demo-rift" />
      <div className="tutorial-demo-hud tutorial-demo-player">
        <strong>플레이어</strong>
        <div><span>♥</span><i><em style={{ width: "100%" }} /></i><b>70 / 70</b></div>
        <div><span>🛡</span><i><em style={{ width: "0%" }} /></i><b>0</b></div>
      </div>
      <div className="tutorial-demo-hud tutorial-demo-enemy">
        <strong>흩어진 세포 덩어리</strong>
        <div><span>♥</span><i><em style={{ width: "100%" }} /></i><b>40 / 40</b></div>
      </div>
      <img className="tutorial-demo-avatar tutorial-demo-player-img" src={assetPath("player.png")} alt="" />
      <img className="tutorial-demo-avatar tutorial-demo-enemy-img" src={assetPath("monster1.png")} alt="" />
      <div className="tutorial-demo-vs">VS</div>
      <div className="tutorial-demo-intent">공격 7</div>

      <div className="tutorial-demo-combo">
        <strong>동물 3콤보 적용 중</strong>
        <div className="tutorial-demo-combo-row">
          <span><b>1</b> 상피세포 <small>세포</small> 🧬</span>
          <i>→</i>
          <span><b>2</b> 상피조직 <small>조직</small> 🧬</span>
          <i>→</i>
          <span><b>3</b> 위 <small>기관</small> 🧬</span>
        </div>
        <div className="tutorial-demo-combo-summary">예상 피해 <em>17</em> 비용 <em>4</em></div>
      </div>

      <div className="tutorial-demo-energy">
        <button>?</button>
        <div><strong>5<small>/20</small></strong><span>에너지</span></div>
        <p>덱 8</p>
      </div>
      <div className="tutorial-demo-cards">
        {demoPlayCards.map((card, index) => (
          <PlayCard
            key={card.uid}
            card={card}
            selected={index > 0 && index < 4}
            order={index > 0 && index < 4 ? index : null}
            fanIndex={index}
            fanTotal={demoPlayCards.length}
            onClick={() => {}}
          />
        ))}
      </div>
      <div className="tutorial-demo-actions">
        <button>카드 발동</button>
        <button>턴 종료</button>
        <button>내 카드</button>
        <button>처음부터</button>
      </div>
    </div>
  );
}

function TutorialModal({ step, onNext, onPrev, onClose }) {
  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;
  return (
    <div className="tutorial-overlay">
      <TutorialDemoScreen />
      <div className="tutorial-shade" />
      <div className={`tutorial-spotlight ${current.spotlight}`} />
      <div className={`tutorial-callout ${current.position}`}>
        <b>{step + 1}</b>
        <strong>{current.title}</strong>
        <span>{current.body}</span>
        <div className="tutorial-controls">
          <button className="button secondary" onClick={onPrev} disabled={step === 0}>이전</button>
          <button className="button" onClick={isLast ? onClose : onNext}>{isLast ? "확인" : "다음"}</button>
        </div>
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
  const [cardListOpen, setCardListOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hardIntroOpen, setHardIntroOpen] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [hardModeStartPool, setHardModeStartPool] = useState(null);
  const [toast, setToast] = useState(null);
  const [started, setStarted] = useState(false);
  const [attackFx, setAttackFx] = useState(null);

  const baseEnemy = ENEMIES[enemyIndex];
  const enemy = {
    ...baseEnemy,
    name: hardMode ? `강화 ${baseEnemy.name}` : baseEnemy.name,
    intent: hardMode ? Math.ceil(baseEnemy.intent * HARD_MODE_INTENT_MULTIPLIER) : baseEnemy.intent,
  };
  const comboResult = calculateComboDamage(selected);
  const comboLength = comboResult.bestLength;
  const selectedCost = selected.reduce((sum, card) => sum + (card.cost || 0), 0);
  const visibleHand = hand;
  const ownedCards = summarizeCards([...hand, ...deck, ...discard]);
  const tutorialTarget = tutorialOpen ? TUTORIAL_STEPS[tutorialStep]?.target : null;

  function openTutorial() {
    setTutorialStep(0);
    setTutorialOpen(true);
  }

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
    if (gameOver || rewardMode || tutorialOpen || hardIntroOpen) return;
    if (isSelected(card)) setSelected((previous) => previous.filter((selectedCard) => selectedCard.uid !== card.uid));
    else setSelected((previous) => [...previous, card]);
  }

  function getSelectedOrder(card) {
    const index = selected.findIndex((selectedCard) => selectedCard.uid === card.uid);
    return index >= 0 ? index + 1 : null;
  }

  function beginHardMode(cardPool) {
    const savedPool = cardPool.map(withoutUid);
    const battleStart = startBattleFromPool(savedPool);
    setHardMode(true);
    setHardModeStartPool(savedPool);
    setEnemyIndex(0);
    setEnemyHp(ENEMIES[0].hp);
    setEnergy(TURN_ENERGY_GAIN);
    setPlayerHp(PLAYER_MAX_HP);
    setBlock(0);
    setRewardMode(false);
    setRewards([]);
    setSelected([]);
    setHand(battleStart.hand);
    setDeck(battleStart.deck);
    setDiscard(battleStart.discard);
    setTurnWarning(null);
    setSkipConfirm(false);
    setRestartConfirm(false);
    setCardListOpen(false);
    setHardIntroOpen(true);
    setGameOver(false);
    setWin(false);
    setAttackFx(null);
    setLog("하드 모드가 시작됩니다. 강화된 적의 공격력이 상승합니다.");
  }

  function retryHardMode() {
    if (!hardModeStartPool) return;
    beginHardMode(hardModeStartPool);
  }

  function enemyAttackAndDraw(messagePrefix, force = false) {
    if (tutorialOpen || hardIntroOpen) return;
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
      setLog(hardMode ? "하드 모드에서 쓰러졌습니다." : "패배했습니다. 다시 도전해보세요.");
    }
  }

  function playSelectedCards() {
    if (gameOver || rewardMode || tutorialOpen || hardIntroOpen) return;
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
        if (hardMode) {
          setWin(true);
          setGameOver(true);
          setLog("승리! 강화된 적까지 모두 물리쳤습니다.");
        } else {
          beginHardMode(getCardPool(nextDeck, nextDiscard, nextHand));
        }
      } else {
        setRewards(pickWeightedRewardCards(3));
        setRewardMode(true);
        setLog("전투 승리! 보상 카드 1장을 선택하세요.");
      }
    }
  }

  function pickReward(card) {
    const rewardCard = withoutUid(card);
    const nextEnemyIndex = enemyIndex + 1;
    const nextDeckPool = getCardPool(deck, discard, hand, [rewardCard]);
    const battleStart = startBattleFromPool(nextDeckPool);
    setEnemyIndex(nextEnemyIndex);
    setEnemyHp(ENEMIES[nextEnemyIndex].hp);
    setEnergy(TURN_ENERGY_GAIN);
    setBlock(0);
    setRewardMode(false);
    setRewards([]);
    setSelected([]);
    setHand(battleStart.hand);
    setDeck(battleStart.deck);
    setDiscard(battleStart.discard);
    setTurnWarning(null);
    setSkipConfirm(false);
    setLog(`${card.name} 카드를 덱에 추가했습니다. 다음 전투를 카드 5장으로 시작합니다.`);
  }

  function resetGame(showTutorial = false) {
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
    setCardListOpen(false);
    setTutorialStep(0);
    setTutorialOpen(showTutorial);
    setHardIntroOpen(false);
    setHardMode(false);
    setHardModeStartPool(null);
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
        .help-button { width:30px; height:30px; border-radius:999px; border:1px solid rgba(255,231,150,.72); background:rgba(0,0,0,.62); color:#ffe9a7; font-size:18px; font-weight:950; cursor:pointer; touch-action:manipulation; box-shadow:0 0 12px rgba(255,225,120,.22); }
        .help-button:hover { filter:brightness(1.12); }
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
        .image-art { position:relative; overflow:hidden; background:#020609; border-color:rgba(91,198,255,.32); }
        .image-art img { width:100%; height:100%; object-fit:cover; display:block; filter:saturate(1.05) contrast(1.04); }
        .image-art::after { content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(255,255,255,.08), transparent 36%, rgba(0,0,0,.24)); pointer-events:none; }
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
        .card-library-modal { width:min(1180px, 100%); max-width:1180px; height:min(720px, calc(100dvh - 38px)); padding:22px 24px 16px; border-radius:10px; border-color:rgba(74,196,255,.38); background:linear-gradient(180deg, rgba(5,13,18,.97), rgba(3,5,7,.98)); box-shadow:0 24px 70px rgba(0,0,0,.78), inset 0 0 34px rgba(41,169,255,.08); overflow:hidden; display:flex; flex-direction:column; }
        .card-library-modal .center { flex:0 0 auto; margin-top:10px; padding-top:8px; }
        .library-header { flex:0 0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .library-header h2 { text-align:left; font-size:38px; letter-spacing:0; text-shadow:0 0 18px rgba(255,231,150,.2); }
        .library-tabs { display:flex; align-items:center; gap:8px; padding:4px; border:1px solid rgba(81,181,255,.24); border-radius:9px; background:rgba(2,10,16,.68); }
        .library-tabs button { min-height:34px; padding:7px 14px; border:0; border-radius:7px; background:transparent; color:#d7c89f; font-size:15px; font-weight:950; cursor:pointer; }
        .library-tabs button.active { color:#fff7da; background:linear-gradient(180deg, rgba(20,116,184,.92), rgba(4,33,68,.92)); box-shadow:0 0 14px rgba(51,175,255,.42), inset 0 0 12px rgba(255,255,255,.08); }
        .library-menu button { min-height:38px; border:1px solid rgba(81,181,255,.24); background:rgba(2,10,16,.68); color:#d7c89f; font-size:16px; font-weight:900; cursor:pointer; }
        .library-menu button.active { color:#fff7da; border-color:rgba(130,217,255,.88); background:linear-gradient(180deg, rgba(20,116,184,.92), rgba(4,33,68,.92)); box-shadow:0 0 16px rgba(51,175,255,.55), inset 0 0 16px rgba(255,255,255,.08); }
        .library-layout { flex:1 1 auto; display:grid; grid-template-columns:230px minmax(0, 1fr); gap:18px; margin-top:16px; min-height:0; }
        .library-sidebar { min-height:0; overflow:auto; padding:16px 14px; border:1px solid rgba(74,196,255,.26); border-radius:8px; background:linear-gradient(180deg, rgba(8,22,32,.76), rgba(2,7,10,.84)); box-shadow:inset 0 0 24px rgba(45,188,255,.06); }
        .library-deck-title { display:flex; align-items:center; gap:10px; min-height:46px; padding:8px 10px; border:1px solid rgba(74,196,255,.22); border-radius:8px; background:rgba(0,0,0,.24); color:#fff7dc; font-size:18px; font-weight:950; }
        .library-deck-title span { width:32px; height:32px; border-radius:999px; display:grid; place-items:center; background:rgba(12,56,104,.74); border:1px solid rgba(83,181,255,.42); }
        .library-stat { margin-top:18px; display:grid; gap:2px; color:#d9c99b; }
        .library-stat b { color:#f7e9ba; font-size:28px; line-height:1; }
        .library-stat span { font-size:14px; font-weight:850; }
        .library-menu { display:grid; gap:8px; margin-top:22px; }
        .library-menu button { width:100%; padding:8px 12px; border-radius:7px; text-align:left; }
        .card-library { display:grid; grid-template-columns:repeat(auto-fill, 178px); justify-content:start; align-content:start; align-items:start; gap:14px; overflow:auto; padding:2px 8px 8px 2px; }
        .library-card { position:relative; width:178px; height:258px; padding:12px; border-radius:10px; border:1px solid color-mix(in srgb, var(--card-base) 66%, #ffe796 12%); background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.12)), radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--card-base) 22%, transparent), transparent 42%), linear-gradient(180deg, color-mix(in srgb, var(--card-deep) 86%, #071019), #020506 88%); box-shadow:0 0 15px var(--card-glow), inset 0 0 14px rgba(255,255,255,.07); }
        .library-card.legendary { border-color:rgba(255,216,112,.88); box-shadow:0 0 18px rgba(255,207,77,.54), inset 0 0 18px rgba(255,226,128,.08); }
        .library-card.locked-reward { filter:brightness(.48) saturate(.72); box-shadow:0 0 8px rgba(0,0,0,.54), inset 0 0 24px rgba(0,0,0,.38); }
        .library-card.locked-reward::after { content:""; position:absolute; inset:0; border-radius:10px; background:rgba(0,0,0,.2); pointer-events:none; }
        .library-card::before { content:""; position:absolute; inset:6px; border:1px solid rgba(113,205,255,.24); border-radius:7px; pointer-events:none; }
        .library-cost { position:absolute; left:10px; top:10px; z-index:3; width:36px; height:36px; border-radius:999px; display:grid; place-items:center; background:radial-gradient(circle at 35% 25%, #c9f5ff, #1479c3 58%, #062545); border:2px solid rgba(214,246,255,.86); color:#fffdf1; font-size:22px; font-weight:950; text-shadow:0 2px 3px rgba(0,0,0,.55); }
        .library-card em { position:absolute; right:10px; top:10px; z-index:3; padding:3px 7px; border-radius:999px; background:rgba(255,233,167,.14); border:1px solid rgba(255,233,167,.28); color:#ffe9a7; font-style:normal; font-size:12px; font-weight:950; }
        .reward-state { position:absolute; right:10px; top:10px; z-index:4; padding:3px 7px; border-radius:999px; background:rgba(0,0,0,.62); border:1px solid rgba(255,233,167,.22); color:#cabd9a; font-size:12px; font-weight:950; }
        .reward-state.acquired { background:rgba(24,104,43,.78); border-color:rgba(142,230,93,.58); color:#f0ffd9; }
        .library-card .card-art { height:124px; margin:2px 0 10px; border-radius:8px; }
        .library-card-main { min-width:0; display:grid; gap:4px; text-align:center; }
        .library-card-main strong { color:#fff7dc; font-size:18px; line-height:1.18; overflow-wrap:anywhere; word-break:keep-all; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:42px; }
        .library-card-main span { color:#ead99a; font-size:13px; font-weight:900; }
        .library-card .effects { margin-top:9px; justify-content:center; white-space:normal; gap:8px; line-height:1.2; }
        .library-card .effects span { padding:0; border-radius:0; background:transparent; border:0; min-width:auto; }
        .tutorial-demo-screen { position:absolute; inset:0; z-index:111; overflow:hidden; background:#030403; }
        .tutorial-demo-screen::before { content:""; position:absolute; inset:0; background:linear-gradient(to right, rgba(0,0,0,.08), rgba(0,0,0,.33)), url('${assetPath("forest-bg.png")}'); background-size:cover; background-position:center; }
        .tutorial-demo-screen::after { content:""; position:absolute; inset:0; background:linear-gradient(to left, rgba(0,0,0,.08), rgba(0,0,0,.48)), url('${assetPath("corruption-bg.png")}'); background-size:cover; background-position:center; clip-path:polygon(51% 0,100% 0,100% 100%,45% 100%); }
        .tutorial-demo-rift { position:absolute; z-index:2; left:47.5%; top:0; width:96px; height:100%; background:linear-gradient(90deg, transparent, rgba(255,232,102,.3), rgba(178,57,255,.24), transparent); transform:skewX(-6deg); }
        .tutorial-demo-hud { position:absolute; z-index:4; top:18px; width:380px; color:#fff7dc; text-shadow:0 3px 8px rgba(0,0,0,.85); font-weight:950; }
        .tutorial-demo-hud strong { display:block; font-size:30px; margin-bottom:10px; }
        .tutorial-demo-hud div { display:grid; grid-template-columns:24px minmax(0, 1fr) 72px; align-items:center; gap:10px; margin:8px 0; font-size:18px; }
        .tutorial-demo-hud i { height:9px; border-radius:999px; background:rgba(0,0,0,.72); box-shadow:inset 0 0 4px rgba(255,255,255,.25); overflow:hidden; }
        .tutorial-demo-hud em { display:block; height:100%; border-radius:999px; background:linear-gradient(90deg,#e92e39,#ffb59d); }
        .tutorial-demo-player { left:58px; }
        .tutorial-demo-enemy { right:58px; text-align:right; }
        .tutorial-demo-enemy div { grid-template-columns:24px minmax(0, 1fr) 86px; }
        .tutorial-demo-avatar { position:absolute; z-index:3; object-fit:contain; filter:drop-shadow(0 20px 18px rgba(0,0,0,.5)); pointer-events:none; }
        .tutorial-demo-player-img { left:14.5%; top:22%; width:min(270px, 21vw); height:min(270px, 34dvh); }
        .tutorial-demo-enemy-img { right:19%; top:24%; width:min(250px, 20vw); height:min(250px, 32dvh); }
        .tutorial-demo-vs { position:absolute; z-index:4; left:50%; top:35%; transform:translate(-50%, -50%); font-family:Georgia,serif; font-size:76px; font-weight:950; color:#ffd990; text-shadow:0 5px 0 #7b3107, 0 0 20px rgba(255,231,137,.55); }
        .tutorial-demo-intent { position:absolute; z-index:4; right:19%; top:calc(24% + min(250px, 32dvh) - 8px); width:min(250px, 20vw); box-sizing:border-box; text-align:center; padding:4px 12px; border-radius:999px; border:1px solid rgba(255,157,157,.5); background:rgba(30,7,18,.74); color:#fff5e2; font-weight:950; }
        .tutorial-demo-combo { position:absolute; z-index:4; left:50%; bottom:265px; width:min(730px, 56vw); transform:translateX(-50%); padding:14px 18px; border-radius:12px; border:1px solid rgba(255,222,104,.42); background:rgba(5,6,8,.82); color:#fff2cf; text-align:center; box-shadow:0 0 22px rgba(0,0,0,.44); font-weight:950; }
        .tutorial-demo-combo > strong { display:block; color:#ffe37b; font-size:20px; margin-bottom:10px; }
        .tutorial-demo-combo-row { display:flex; align-items:center; justify-content:center; gap:12px; }
        .tutorial-demo-combo-row span { display:flex; align-items:center; gap:7px; min-width:0; padding:7px 12px; border-radius:10px; background:rgba(0,0,0,.56); border:1px solid rgba(147,213,92,.58); font-size:20px; }
        .tutorial-demo-combo-row b { width:28px; height:28px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; background:linear-gradient(180deg,#6fd4ff,#236fb4); border:2px solid rgba(255,255,255,.78); }
        .tutorial-demo-combo-row small { color:#e3d59c; font-size:15px; }
        .tutorial-demo-combo-row i { font-style:normal; font-size:24px; color:#ffe9a7; }
        .tutorial-demo-combo-summary { margin-top:10px; font-size:22px; }
        .tutorial-demo-combo-summary em { margin:0 18px 0 8px; color:#9eff6f; font-style:normal; }
        .tutorial-demo-energy { position:absolute; z-index:4; left:26px; bottom:34px; width:154px; display:grid; gap:8px; justify-items:center; color:#fff7dc; font-weight:950; text-shadow:0 3px 8px rgba(0,0,0,.75); }
        .tutorial-demo-energy button { width:34px; height:34px; border-radius:999px; border:1px solid rgba(255,225,122,.7); background:rgba(0,0,0,.7); color:#ffe57e; font-size:22px; font-weight:950; }
        .tutorial-demo-energy div { width:112px; height:112px; border-radius:999px; display:grid; place-items:center; background:radial-gradient(circle at 50% 35%, #9dff55, #1d681f 56%, #071408); border:2px solid rgba(255,235,143,.62); box-shadow:0 0 26px rgba(93,255,74,.42); }
        .tutorial-demo-energy strong { font-size:40px; line-height:1; }
        .tutorial-demo-energy small { font-size:18px; }
        .tutorial-demo-energy span { display:block; font-size:18px; }
        .tutorial-demo-energy p { width:100%; margin:0; padding:9px 8px; border-radius:8px; background:rgba(0,0,0,.7); border:1px solid rgba(255,231,150,.24); text-align:center; font-size:16px; }
        .tutorial-demo-cards { position:absolute; z-index:4; left:50%; bottom:10px; transform:translateX(-50%); width:780px; height:220px; display:flex; align-items:flex-end; justify-content:center; pointer-events:none; }
        .tutorial-demo-cards .play-card { width:128px; height:178px; flex-basis:128px; }
        .tutorial-demo-cards .card-art { height:58px; }
        .tutorial-demo-cards .effects { gap:4px; font-size:13px; flex-wrap:wrap; line-height:1.05; margin-top:7px; }
        .tutorial-demo-cards .card-top strong { font-size:15px; }
        .tutorial-demo-cards .card-type { font-size:12px; }
        .tutorial-demo-card { position:relative; width:134px; height:178px; margin-left:-10px; padding:13px 9px 10px; border-radius:16px; border:2px solid rgba(255,231,144,.5); background:linear-gradient(160deg, rgba(26,82,106,.94), rgba(5,9,9,.96)); color:#fff4cf; text-align:center; font-weight:950; box-shadow:0 0 20px rgba(255,231,144,.18); transform:rotate(var(--rot)); }
        .tutorial-demo-card:first-child { margin-left:0; }
        .tutorial-demo-card.card-1 { --rot:-10deg; }
        .tutorial-demo-card.card-2 { --rot:-6deg; }
        .tutorial-demo-card.card-3 { --rot:0deg; border-color:#ffe881; box-shadow:0 0 22px rgba(255,232,129,.55); }
        .tutorial-demo-card.card-4 { --rot:5deg; border-color:#ffe881; box-shadow:0 0 22px rgba(255,232,129,.55); }
        .tutorial-demo-card.card-5 { --rot:9deg; background:linear-gradient(160deg, rgba(46,97,31,.94), rgba(6,12,7,.96)); }
        .tutorial-demo-card b { position:absolute; left:10px; top:9px; width:34px; height:34px; border-radius:999px; display:grid; place-items:center; background:linear-gradient(180deg,#6fd4ff,#236fb4); border:2px solid rgba(255,255,255,.75); font-size:22px; }
        .tutorial-demo-card strong { display:block; margin:8px 0 14px 34px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:17px; }
        .tutorial-demo-card span { display:grid; place-items:center; height:54px; margin:8px 0; border-radius:10px; background:radial-gradient(circle, rgba(91,198,255,.35), rgba(0,0,0,.48)); font-size:30px; }
        .tutorial-demo-card em { display:block; color:#f7e6b2; font-style:normal; font-size:14px; line-height:1.6; }
        .tutorial-demo-card small { position:absolute; left:0; right:0; bottom:8px; font-size:14px; }
        .tutorial-demo-card mark { position:absolute; right:-13px; top:-15px; width:34px; height:34px; border-radius:999px; display:grid; place-items:center; background:#ffe985; color:#1b1400; font-size:20px; font-weight:950; z-index:2; }
        .tutorial-demo-actions { position:absolute; z-index:4; right:34px; bottom:34px; width:225px; display:grid; gap:9px; }
        .tutorial-demo-actions button { min-height:44px; border-radius:12px; border:1px solid rgba(255,231,150,.54); color:#fff7dc; background:linear-gradient(180deg,#327331,#103816); font-size:18px; font-weight:950; }
        .tutorial-demo-actions button:nth-child(2) { background:linear-gradient(180deg,#783434,#35100f); }
        .tutorial-demo-actions button:nth-child(n+3) { background:linear-gradient(180deg,#202832,#07090d); }
        .tutorial-focus { position:relative; }
        .tutorial-overlay { position:fixed; inset:0; z-index:110; pointer-events:auto; }
        .tutorial-shade { position:absolute; inset:0; background:transparent; }
        .tutorial-spotlight { position:absolute; z-index:120; border:3px solid #ffe06c; border-radius:16px; background:rgba(255,239,128,.04); box-shadow:0 0 0 9999px rgba(0,0,0,.66), 0 0 26px rgba(255,224,108,.78), inset 0 0 18px rgba(255,224,108,.18); pointer-events:none; }
        .tutorial-callout { position:absolute; z-index:130; width:clamp(230px, 23vw, 340px); padding:14px 14px 14px 42px; border-radius:12px; background:rgba(6,8,10,.94); border:2px solid #ffd45f; color:#f7edcf; box-shadow:0 0 18px rgba(0,0,0,.55); font-weight:850; text-align:left; }
        .tutorial-callout b { position:absolute; left:-12px; top:-12px; width:30px; height:30px; border-radius:999px; display:flex; align-items:center; justify-content:center; background:#ffdb69; color:#1e1503; border:2px solid rgba(255,255,255,.8); font-size:17px; font-weight:950; }
        .tutorial-callout strong { display:block; margin-bottom:5px; color:#ffe98d; font-size:15px; font-weight:950; }
        .tutorial-callout span { display:block; color:#f2e6c9; font-size:12px; line-height:1.55; text-align:left; word-break:keep-all; overflow-wrap:anywhere; }
        .tutorial-controls { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
        .tutorial-controls .button { min-height:32px; padding:6px 12px; font-size:12px; border-radius:9px; }
        .spotlight-player { left:30px; top:12px; width:410px; height:138px; }
        .spotlight-energy { left:20px; bottom:30px; width:158px; height:220px; }
        .spotlight-hand { left:50%; bottom:0; transform:translateX(-50%); width:800px; height:220px; border-color:#6bb8ff; box-shadow:0 0 0 9999px rgba(0,0,0,.66), 0 0 26px rgba(91,198,255,.72), inset 0 0 18px rgba(91,198,255,.16); }
        .spotlight-combo { left:50%; bottom:258px; transform:translateX(-50%); width:760px; height:158px; border-color:#c87bff; box-shadow:0 0 0 9999px rgba(0,0,0,.66), 0 0 26px rgba(200,123,255,.72), inset 0 0 18px rgba(200,123,255,.16); }
        .spotlight-actions { right:28px; bottom:28px; width:238px; height:226px; border-color:#8ee65d; box-shadow:0 0 0 9999px rgba(0,0,0,.66), 0 0 26px rgba(126,217,87,.72), inset 0 0 18px rgba(126,217,87,.16); }
        .spotlight-enemy { right:42px; top:10px; width:430px; height:142px; border-color:#c87bff; box-shadow:0 0 0 9999px rgba(0,0,0,.66), 0 0 26px rgba(200,123,255,.72), inset 0 0 18px rgba(200,123,255,.16); }
        .tutorial-player-note { left:462px; top:26px; }
        .tutorial-energy-note { left:194px; bottom:116px; }
        .tutorial-hand-note { left:50%; bottom:238px; transform:translateX(-50%); border-color:#4fa3ff; }
        .tutorial-hand-note b { background:#67b6ff; }
        .tutorial-combo-note { left:50%; bottom:432px; transform:translateX(-50%); border-color:#c87bff; }
        .tutorial-combo-note b { background:#c88dff; }
        .tutorial-actions-note { right:286px; bottom:78px; border-color:#7ed957; }
        .tutorial-actions-note b { background:#8ee65d; }
        .tutorial-enemy-note { right:492px; top:26px; border-color:#c87bff; }
        .tutorial-enemy-note b { background:#c88dff; }
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
          .library-card .card-art { height:104px; }
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
          .card-library-modal { height:min(680px, calc(100dvh - 22px)); padding:14px; border-radius:10px; }
          .library-header h2 { font-size:30px; }
          .card-library-modal .center { margin-top:7px; padding-top:5px; }
          .library-layout { grid-template-columns:154px minmax(0, 1fr); gap:10px; margin-top:10px; }
          .library-sidebar { padding:10px; }
          .library-deck-title { min-height:38px; font-size:14px; }
          .library-deck-title span { width:26px; height:26px; }
          .library-stat { margin-top:10px; }
          .library-stat b { font-size:21px; }
          .library-stat span { font-size:11px; }
          .library-menu { gap:5px; margin-top:12px; }
          .library-menu button { min-height:30px; padding:5px 9px; font-size:12px; }
          .card-library { grid-template-columns:repeat(auto-fill, 136px); gap:9px; }
          .library-card { width:136px; height:210px; padding:9px; }
          .library-card .card-art { height:88px; margin-bottom:8px; }
          .library-cost { width:29px; height:29px; font-size:17px; }
          .library-card-main strong { min-height:34px; font-size:14px; }
          .library-card-main span { font-size:11px; }
          .library-card .effects { gap:5px; font-size:10px; }
          .help-button { width:26px; height:26px; font-size:15px; }
          .tutorial-callout { width:170px; padding:8px 9px 8px 28px; border-width:1px; }
          .tutorial-callout b { width:24px; height:24px; font-size:13px; left:-9px; top:-9px; }
          .tutorial-callout strong { font-size:12px; margin-bottom:3px; }
          .tutorial-callout span { font-size:10px; line-height:1.3; }
          .tutorial-controls { gap:5px; margin-top:7px; }
          .tutorial-controls .button { min-height:26px; padding:4px 7px; font-size:10px; }
          .tutorial-spotlight { border-width:2px; border-radius:12px; }
          .spotlight-player { left:8px; top:8px; width:min(230px, 42vw); height:94px; }
          .spotlight-enemy { right:8px; top:8px; width:min(230px, 42vw); height:94px; }
          .spotlight-energy { left:8px; bottom:24px; width:76px; height:156px; }
          .spotlight-hand { width:min(640px, 66vw); height:124px; bottom:12px; }
          .spotlight-combo { width:min(420px, 54vw); height:84px; bottom:144px; }
          .spotlight-actions { right:6px; bottom:18px; width:96px; height:204px; }
          .tutorial-player-note { left:248px; top:10px; }
          .tutorial-enemy-note { right:248px; top:10px; }
          .tutorial-energy-note { left:92px; bottom:88px; }
          .tutorial-hand-note { left:50%; bottom:144px; }
          .tutorial-combo-note { left:50%; bottom:238px; width:190px; }
          .tutorial-actions-note { right:110px; bottom:88px; }
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
            <button className="start-button" onClick={() => resetGame(true)}>게임 시작</button>
          </div>
        </div>
      )}
      <div className="wrap">
        <section className="battle">
          <div className="rift" />
          <div className={`hud player-hud ${tutorialTarget === "player" ? "tutorial-focus" : ""}`}>
            <div className="hud-title">플레이어</div>
            <HpBar current={playerHp} max={PLAYER_MAX_HP} />
            <BlockBar block={block} />
          </div>
          <div className={`hud enemy-hud ${tutorialTarget === "enemy" ? "tutorial-focus" : ""}`}>
            <div className="hud-title">{enemy.name}</div>
            <HpBar current={enemyHp} max={enemy.hp} align="right" />
          </div>
          <div className={`fighter player-side ${attackFx === "player" ? "attack-player" : ""} ${attackFx === "enemy" ? "hit-player" : ""}`}><PlayerAvatar /></div>
          <div className={`fighter enemy-side ${attackFx === "enemy" ? "attack-enemy" : ""} ${attackFx === "player" ? "hit-enemy" : ""}`}><EnemyAvatar enemy={enemy} /><div className="enemy-intent">공격 {enemy.intent}</div></div>
          <div className="vs">VS</div>
        </section>

        <section className="bottom">
          <div className={`energy-panel ${tutorialTarget === "energy" ? "tutorial-focus" : ""}`}>
            <button className="help-button" onClick={openTutorial} disabled={!started || rewardMode || gameOver}>?</button>
            <div className="energy-orb"><div className="energy-number">{energy}<small>/{MAX_ENERGY}</small></div><div className="energy-label">에너지</div></div>
            <div className="deck-mini"><span>덱 {deck.length}</span></div>
          </div>
          <div className="hand-zone">
            <div className={tutorialTarget === "combo" ? "tutorial-focus" : ""}>
              <SelectedComboBar selected={selected} comboResult={comboResult} selectedCost={selectedCost} />
            </div>
            <div className={`cards ${tutorialTarget === "hand" ? "tutorial-focus" : ""}`}>
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
          <div className={`action-panel ${tutorialTarget === "actions" ? "tutorial-focus" : ""}`}>
            <button className="button" onClick={playSelectedCards} disabled={gameOver || rewardMode || tutorialOpen || hardIntroOpen}>카드 발동</button>
            <button className="button danger" onClick={() => setSkipConfirm(true)} disabled={gameOver || rewardMode || tutorialOpen || hardIntroOpen}>턴 종료</button>
            <button className="button secondary" onClick={() => setCardListOpen(true)} disabled={tutorialOpen || hardIntroOpen}>내 카드</button>
            <button className="button secondary restart-button" onClick={() => setRestartConfirm(true)}>처음부터</button>
          </div>
        </section>
      </div>

      {tutorialOpen && started && (
        <TutorialModal
          step={tutorialStep}
          onPrev={() => setTutorialStep((current) => Math.max(0, current - 1))}
          onNext={() => setTutorialStep((current) => Math.min(TUTORIAL_STEPS.length - 1, current + 1))}
          onClose={() => setTutorialOpen(false)}
        />
      )}
      {cardListOpen && <CardLibraryModal cards={ownedCards} rewardCards={REWARD_CARDS} onClose={() => setCardListOpen(false)} />}

      {hardIntroOpen && !gameOver && (
        <div className="modal-bg"><div className="modal" style={{ maxWidth: 600, textAlign: "center" }}><h2>하드 모드 시작</h2><p className="confirm-message">처음 적 3마리를 모두 물리쳤습니다. 이제 같은 적들이 강화되어 다시 등장합니다. 적 공격력이 상승하며, 마지막 강화 보스를 잡아야 최종 승리입니다.</p><div className="center"><button className="button" onClick={() => setHardIntroOpen(false)}>하드 모드 도전</button></div></div></div>
      )}

      {rewardMode && (
        <div className="modal-bg"><div className="modal"><h2>보상 카드 선택</h2><div className="reward-grid">
          {rewards.map((card) => <PlayCard key={card.uid} card={card} reward onClick={() => pickReward(card)} />)}
        </div></div></div>
      )}

      {skipConfirm && !gameOver && (
        <div className="modal-bg"><div className="modal" style={{ maxWidth: 560 }}><h2>턴을 종료하시겠습니까?</h2><p className="confirm-message">적이 공격하고, 다음 턴에 카드 {TURN_DRAW_COUNT}장을 드로우합니다.</p><div className="center"><button className="button danger" onClick={() => enemyAttackAndDraw("턴을 넘겼습니다.")}>종료</button><button className="button secondary" onClick={() => setSkipConfirm(false)}>취소</button></div></div></div>
      )}

      {turnWarning && !gameOver && (
        <div className="modal-bg"><div className="modal" style={{ maxWidth: 580 }}><h2>자원이 최대치를 넘습니다</h2><p className="warning-message">{turnWarning.message}</p><div className="center"><button className="button danger" onClick={() => enemyAttackAndDraw("초과를 감수하고 턴을 넘겼습니다.", true)}>그래도 종료</button><button className="button secondary" onClick={() => setTurnWarning(null)}>취소</button></div></div></div>
      )}

      {restartConfirm && !gameOver && (
        <div className="modal-bg"><div className="modal" style={{ maxWidth: 560 }}><h2>처음부터 다시 시작할까요?</h2><p className="confirm-message">현재 전투와 보상 진행이 초기화되고, 시작 덱을 새로 섞어 다시 시작합니다.</p><div className="center"><button className="button danger" onClick={() => resetGame(false)}>다시 시작</button><button className="button secondary" onClick={() => setRestartConfirm(false)}>취소</button></div></div></div>
      )}

      {gameOver && hardMode && !win && (
        <div className="modal-bg"><div className="modal" style={{ maxWidth: 560, textAlign: "center" }}><div style={{ fontSize: 54 }}>🧬</div><h2>강화 단계에서 쓰러졌습니다</h2><p className="confirm-message">생명체 구성은 완성됐지만, 강화된 적의 공격을 버티지 못했습니다. 현재 덱으로 하드 모드에 다시 도전하시겠습니까?</p><div className="center"><button className="button" onClick={retryHardMode}>하드 모드 재도전</button><button className="button secondary" onClick={() => resetGame(false)}>처음부터</button></div></div></div>
      )}

      {gameOver && (!hardMode || win) && (
        <div className="modal-bg"><div className="modal" style={{ maxWidth: 520, textAlign: "center" }}><div style={{ fontSize: 54 }}>{win ? "🏆" : "🧬"}</div><h2>{win ? "최종 승리!" : "패배"}</h2><p className="confirm-message">{win ? "노말 모드와 하드 모드를 모두 돌파했습니다." : "다시 도전해보세요."}</p><button className="button" onClick={() => resetGame(false)}>{win ? "처음부터" : "다시 도전"}</button></div></div>
      )}
    </div>
  );
}
