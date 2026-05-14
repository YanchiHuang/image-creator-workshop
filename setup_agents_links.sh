#!/usr/bin/env bash

# ================================
# Agent Symlink Setup Script
# ================================

set -euo pipefail

# ----------------
# 設定區
# ----------------

# 工具目錄（可依需求擴充）
TOOLS=(.codex .claude .github .gemini)

# agents 主目錄
AGENTS_DIR=".agents"

# ----------------
# 檢查環境
# ----------------

if [ ! -d "$AGENTS_DIR" ]; then
  echo "❌ 找不到 $AGENTS_DIR 目錄，請先建立"
  exit 1
fi

# 取得 .agents 底下所有子目錄（排除隱藏檔）
AGENT_SUBDIRS=()
while IFS= read -r dir; do
  AGENT_SUBDIRS+=("$dir")
done < <(find "$AGENTS_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \;)

if [ ${#AGENT_SUBDIRS[@]} -eq 0 ]; then
  echo "⚠️  $AGENTS_DIR 沒有任何子目錄，無需建立 symlink"
  exit 0
fi

echo "🔍 偵測到以下 agent 模組："
for dir in "${AGENT_SUBDIRS[@]}"; do
  echo "  - $dir"
done

echo ""

# ----------------
# 建立 symlink
# ----------------

echo "🔗 開始建立 symlink..."

for tool in "${TOOLS[@]}"; do
  echo ""
  echo "📁 處理工具目錄：$tool"

  # 若不存在則建立
  mkdir -p "$tool"

  for dir in "${AGENT_SUBDIRS[@]}"; do
    target="../$AGENTS_DIR/$dir"
    link="$tool/$dir"

    # 如果已存在且不是 symlink → 跳過（避免毀資料）
    if [ -e "$link" ] && [ ! -L "$link" ]; then
      echo "  ⚠️ 跳過 $link（存在且不是 symlink）"
      continue
    fi

    # 建立或覆蓋 symlink
    ln -sfn "$target" "$link"

    echo "  ✔ $link → $target"
  done
done

echo ""
echo "✅ Symlink 建立完成！"