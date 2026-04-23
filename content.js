// Comments How I Want Them
//
// Automatically switches every comment-filter dropdown to "All comments."
//
// Two detection strategies are combined to work across languages:
//
// 1. **Structural**: find [role="button"] elements with aria-haspopup near
//    comment sections, regardless of their text label.
// 2. **Text-based fallback**: match known filter labels in ~30 languages.
//
// Once the dropdown opens, we always click the **last menu item**, which is
// "All comments" in every language Facebook supports.

class CommentFilterSwitcher {
	static CLICK_DELAY = 600
	static MENU_WAIT = 800

	// Known filter labels (lowercase) in ~30 languages.  Used as a secondary
	// signal — structural detection is the primary strategy.
	static FILTER_LABELS = new Set([
		// English
		'most relevant',
		'newest',
		'most recent',
		// Spanish
		'más relevantes',
		'más recientes',
		// Portuguese
		'mais relevantes',
		'mais recentes',
		// French
		'les plus pertinents',
		'plus pertinents',
		'les plus récents',
		// German
		'relevanteste',
		'am relevantesten',
		'neueste',
		// Italian
		'più pertinenti',
		'più recenti',
		// Dutch
		'meest relevant',
		'nieuwste',
		// Polish
		'najtrafniejsze',
		'najnowsze',
		// Romanian
		'cele mai relevante',
		'cele mai recente',
		// Czech
		'nejrelevantnější',
		'nejnovější',
		// Hungarian
		'legrelevánsabb',
		'legújabb',
		// Swedish
		'mest relevanta',
		'senaste',
		// Danish
		'mest relevante',
		'nyeste',
		// Norwegian
		'mest relevante',
		'nyeste',
		// Finnish
		'osuvimmat',
		'uusimmat',
		// Greek
		'πιο σχετικά',
		'νεότερα',
		// Turkish
		'en alakalı',
		'en yeniler',
		// Russian
		'самые актуальные',
		'сначала новые',
		// Ukrainian
		'найактуальніші',
		'найновіші',
		// Arabic
		'الأكثر صلة',
		'الأحدث',
		// Hebrew
		'הרלוונטיים ביותר',
		'החדשים ביותר',
		// Hindi
		'सबसे प्रासंगिक',
		'सबसे नए',
		// Bengali
		'সবচেয়ে প্রাসঙ্গিক',
		// Urdu
		'سب سے زیادہ متعلقہ',
		// Thai
		'เกี่ยวข้องมากที่สุด',
		'ใหม่ที่สุด',
		// Vietnamese
		'phù hợp nhất',
		'mới nhất',
		// Indonesian
		'paling relevan',
		'terbaru',
		// Malay
		'paling berkaitan',
		'terbaharu',
		// Filipino / Tagalog
		'pinakanauugnay',
		'pinakabago',
		// Japanese
		'最も関連性の高い',
		'関連度順',
		'新しい順',
		// Korean
		'관련성 높은 순',
		'최신순',
		// Chinese (Simplified)
		'最相关',
		'最新',
		// Chinese (Traditional)
		'最相關',
		'最新'
	])

	constructor() {
		this.processed = new WeakSet()
		this.scanTimer = null
		this.observer = null
	}

	simulateClick(el) {
		for (const type of ['mousedown', 'mouseup', 'click']) {
			el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }))
		}
	}

	/** Check whether an element looks like a comment-filter dropdown button. */
	looksLikeFilterButton(el) {
		// Must be visible.
		if (el.offsetParent === null) {
			return false
		}

		// Must be small — filter buttons are compact, not large action buttons.
		const rect = el.getBoundingClientRect()
		if (rect.width > 350 || rect.height > 60) {
			return false
		}
		if (rect.width < 20 || rect.height < 10) {
			return false
		}

		// Should have short text (the label is 1-3 words in most languages).
		const text = el.textContent.trim()
		if (text.length === 0 || text.length > 40) {
			return false
		}

		return true
	}

	/**
	 * Check whether an element is near a Facebook comment section by looking for
	 * comment-like siblings/descendants in the same post container.
	 */
	isNearComments(el) {
		// Walk up to find a reasonable container (post boundary).
		let container = el.parentElement
		for (let i = 0; i < 8 && container; i++) {
			if (
				container.querySelector('[contenteditable="true"]') ||
				container.querySelector('[role="article"]') ||
				container.querySelector('ul[role="list"]')
			) {
				return true
			}
			container = container.parentElement
		}
		return false
	}

	findFilterButtons() {
		const results = []

		// --- Strategy 1: structural detection ---
		const popupButtons = document.querySelectorAll(
			'[role="button"][aria-haspopup="menu"],' +
				'[role="button"][aria-haspopup="listbox"],' +
				'[role="button"][aria-expanded]'
		)
		for (const btn of popupButtons) {
			if (this.processed.has(btn)) {
				continue
			}
			if (!this.looksLikeFilterButton(btn)) {
				continue
			}
			if (!this.isNearComments(btn)) {
				continue
			}
			results.push(btn)
		}

		// --- Strategy 2: text-based detection (multilingual) ---
		for (const span of document.querySelectorAll('span')) {
			const text = span.textContent.trim().toLowerCase()
			if (!CommentFilterSwitcher.FILTER_LABELS.has(text)) {
				continue
			}

			const button = span.closest('[role="button"]') || span.closest('div[tabindex]') || span.parentElement
			if (!button || this.processed.has(button)) {
				continue
			}
			if (button.offsetParent === null) {
				continue
			}

			results.push(button)
		}

		return results
	}

	/**
	 * After opening a dropdown, find the newly appeared menu and click its
	 * **last** item.  On Facebook the comment-filter options are ordered:
	 *   1. Most relevant
	 *   2. Newest
	 *   3. All comments          <-- always last
	 */
	clickLastMenuItem() {
		const menus = document.querySelectorAll('[role="menu"], [role="listbox"]')

		for (const menu of menus) {
			if (menu.offsetParent === null) {
				continue
			}

			const items = menu.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="option"]')
			if (items.length >= 2 && items.length <= 5) {
				const lastItem = items[items.length - 1]
				this.simulateClick(lastItem)
				return true
			}
		}

		// Fallback: look for a visible cluster of menuitems not inside a
		// [role="menu"] wrapper (Facebook sometimes omits the wrapper).
		const allItems = document.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="option"]')
		const visible = [...allItems].filter(i => i.offsetParent !== null)
		if (visible.length >= 2 && visible.length <= 5) {
			this.simulateClick(visible[visible.length - 1])
			return true
		}

		return false
	}

	processFilterButton(button) {
		if (this.processed.has(button)) {
			return
		}
		this.processed.add(button)

		setTimeout(() => {
			if (!document.body.contains(button)) {
				return
			}

			// Open the dropdown.
			this.simulateClick(button)

			// Wait for the menu to render, then pick the last item.
			setTimeout(() => {
				if (!this.clickLastMenuItem()) {
					// Retry once if the menu was slow to appear.
					setTimeout(() => this.clickLastMenuItem(), CommentFilterSwitcher.MENU_WAIT)
				}
			}, CommentFilterSwitcher.MENU_WAIT)
		}, CommentFilterSwitcher.CLICK_DELAY)
	}

	scan() {
		for (const btn of this.findFilterButtons()) {
			this.processFilterButton(btn)
		}
	}

	debouncedScan() {
		if (this.scanTimer) {
			return
		}
		this.scanTimer = setTimeout(() => {
			this.scanTimer = null
			this.scan()
		}, 1500)
	}

	start() {
		this.scan()

		this.observer = new MutationObserver(() => this.debouncedScan())
		this.observer.observe(document.body, { childList: true, subtree: true })
	}
}

const commentFilterSwitcher = new CommentFilterSwitcher()
commentFilterSwitcher.start()
