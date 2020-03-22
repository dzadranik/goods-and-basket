var { addGoodToBasket, getLocalSorage, removeGoodFromBasket, getCountGoodsInBasket } = BasketSetting(),
	{ addPagingGetItemsInPage, setActivePage } = Paging(),
	{ loadGoods, setAvaliable, setSorting, getGoodInformation } = GoodSetting(),
	{ findContainersAndRemoveClass } = containerClassSetting()

document.addEventListener('DOMContentLoaded', function() {
	const handler = (element, eventName, fn) => {
		const elementContainer = document.querySelector(element)
		elementContainer.addEventListener(eventName, event => fn(event))
	}

	//слушалка кнопок пагинатора
	handler('.js-pagination', 'click', event => {
		const targetElement = event.target
		if (targetElement.classList.contains('js-pagination-button') && !targetElement.classList.contains('active')) {
			setActivePage(targetElement.dataset.pButtonNumber - 1)
		}
	})

	// слушалка сортировок
	handler('.js-sorting-buttons', 'click', event => {
		const targetElement = event.target
		if (targetElement.classList.contains('js-sorting') && !targetElement.classList.contains('active')) {
			const sortingSetting = targetElement.dataset.sorting
			findContainersAndRemoveClass('.js-sorting', 'active')
			setSorting(sortingSetting)
			targetElement.classList.add('active')
		}
	})

	// слушалка сортировки по наличию
	handler('.js-avaliable', 'change', event => {
		setAvaliable(event.target.checked)
	})

	// кнопка добавить в корзину
	handler('.js-good', 'click', event => {
		if (event.target.classList.contains('js-add-to-basket')) {
			let goodId = event.target.closest('.js-good-item').dataset.goodId
			addGoodToBasket(getGoodInformation(goodId))
		}
	})

	// кнопка удалить из корзины
	handler('.js-basket-good', 'click', event => {
		if (event.target.classList.contains('js-remove-good')) {
			removeGoodFromBasket(event.target.parentElement.dataset.bGoodId)
		}
	})
})

loadGoods()
getLocalSorage()

//Добавление элементов в контейнер
function addContentToContainer(containerClass, element) {
	const container = document.querySelector(containerClass)
	if (container) container.innerHTML = element
}

//удалить класс у группы контейнеров
function containerClassSetting() {
	const removeClassInContainer = (allContainers, className, i = 0) => {
		if (i < allContainers.length) {
			allContainers[i].classList.remove(className)
			return removeClassInContainer(allContainers, className, i + 1)
		}
	}
	return {
		findContainersAndRemoveClass: (containerClass, className) => {
			let allContainers = document.querySelectorAll(containerClass)
			removeClassInContainer(allContainers, className)
		}
	}
}

// товары
function GoodSetting() {
	var goodsInPage = [],
		avaliable = false,
		sortingValue = 'name'

	const sortingAvaliable = goods => {
		return goods.filter(elem => elem.avaliable)
	}

	const sortingByCost = goods => {
		return goods.sort((prev, next) => prev.price - next.price)
	}

	const sortingByName = goods => {
		return goods.sort((prev, next) => {
			const x = prev.title.toLowerCase()
			const y = next.title.toLowerCase()
			if (x < y) return -1
			if (x < y) return 1
		})
	}

	const sorting = goods => {
		if (avaliable) goods = sortingAvaliable(goods)

		if (sortingValue == 'cost') goods = sortingByCost(goods)
		else if (sortingValue == 'name') goods = sortingByName(goods)
		return goods
	}

	const getGoodContent = good => {
		let { id, image, title, price, descr } = good
		return `<div class="good__item js-good-item" data-good-id=${id}>
					<div class="good__image"><img src="${image}"/></div>
					<div class="good__information">
						<div class="good__title">${title}</div>
						<div class="good__price">${price} руб</div>
						<div class="good__description">${descr}</div>
					</div>
					<div class="good__transaction">
						<button class="good__button js-add-to-basket">Добавить в корзину</button>
						<div class="good__basket-feedback js-good-in-basket"></div>
					</div>
				</div>`
	}

	function addGoodsToContainer(goods) {
		goodsInPage = goods
		const goodsContent = goods.map(good => getGoodContent(good)).join('')
		addContentToContainer('.js-good', goodsContent)
	}

	return {
		loadGoods: () => {
			fetch('https://dzadranik.github.io/wc/src/json/goods.json')
				.then(response => response.json())
				.then(goods => {
					addGoodsToContainer(addPagingGetItemsInPage(sorting(goods)))
				})
		},
		setAvaliable: value => {
			avaliable = value
			setActivePage(0)
			loadGoods()
		},
		setSorting: value => {
			if (sortingValue != value) {
				sortingValue = value
				loadGoods()
			}
		},
		getGoodInformation: id => {
			return goodsInPage.find(item => item.id == id)
		}
	}
}

//пагинация
function Paging() {
	const amountPageItems = 5 // количество элементов на странице
	var numberActivePage = 0 // активная страница

	const getPButtonContent = number => {
		return `<button 
			class="pagination__button js-pagination-button ${number === numberActivePage ? 'active' : ''}" 
			data-p-button-number="${number + 1}">
				${number + 1}
			</button>`
	}

	const getPDotsContent = () => {
		return `<span class='pagination__dots'>...</span>`
	}

	const getPButtonsNumberContent = (first, last, pButtonsContent = '') => {
		if (first < last) {
			pButtonsContent += getPButtonContent(first)
			return getPButtonsNumberContent(first + 1, last, pButtonsContent)
		}
		return pButtonsContent
	}

	const getPButtonsContent = items => {
		let amountButtons = Math.ceil(items.length / amountPageItems), // количество страниц
			pButtonsContent = '' // разметка кнопок пагинации

		if (amountButtons > 6) {
			if (numberActivePage < 2 || numberActivePage > amountButtons - 3) {
				pButtonsContent += getPButtonsNumberContent(0, 3)
				pButtonsContent += getPDotsContent()
				pButtonsContent += getPButtonsNumberContent(amountButtons - 3, amountButtons)
			} else if (numberActivePage == 2) {
				pButtonsContent += getPButtonsNumberContent(0, 4)
				pButtonsContent += getPDotsContent()
				pButtonsContent += getPButtonsNumberContent(amountButtons - 1, amountButtons)
			} else if (numberActivePage == amountButtons - 3) {
				pButtonsContent += getPButtonsNumberContent(0, 1)
				pButtonsContent += getPDotsContent()
				pButtonsContent += getPButtonsNumberContent(amountButtons - 4, amountButtons)
			} else if (numberActivePage > 2 && numberActivePage < amountButtons - 3) {
				pButtonsContent += getAnyPButtons(0, 1)
				pButtonsContent += getPButtonsNumberContent()
				pButtonsContent += getAnyPButtons(numberActivePage - 1, numberActivePage + 2)
				pButtonsContent += getPButtonsNumberContent()
				pButtonsContent += getAnyPButtons(amountButtons - 1, amountButtons)
			}
		} else {
			pButtonsContent += getPButtonsNumberContent(0, amountButtons)
		}
		return pButtonsContent
	}

	const getItemsInActivePage = items => {
		const firstItem = numberActivePage * amountPageItems,
			lastItem = firstItem + amountPageItems
		return items.slice(firstItem, lastItem)
	}

	return {
		setActivePage: number => {
			numberActivePage = number
			loadGoods()
		},
		addPagingGetItemsInPage: items => {
			addContentToContainer('.js-pagination', getPButtonsContent(items))
			return getItemsInActivePage(items)
		}
	}
}

//корзина
function BasketSetting() {
	var goodsInBasket = []

	const getGoodContent = good => {
		let { id, image, title, count } = good
		return `<div class="basket__good-item" data-b-good-id="${id}">
			<button class="basket__good-remove js-remove-good">&#128938;</button>
			<div class="basket__good-image"><img src="${image}"/></div>
			<div class="basket__good-name">${title}</div>
			<div class="basket__good-amout">${count}</div>
		</div>`
	}

	const addGoodToContainer = () => {
		let goodsContent = goodsInBasket.map(good => getGoodContent(good)).join('')
		addContentToContainer('.js-basket-good', goodsContent)
	}

	const findGoodAndRemove = id => {
		let index = goodsInBasket.findIndex(item => item.id === +id)
		goodsInBasket.splice(index, 1)
	}
	const findGoodAndAdd = good => {
		if (
			!goodsInBasket.find(item => {
				if (good.id === item.id) {
					item.count++
					return true
				}
			})
		) {
			good.count = 1
			goodsInBasket = [...goodsInBasket, good]
		}
	}

	const countTotalCost = () => {
		let totalCost = goodsInBasket.reduce(function(sum, item) {
			return sum + item.count * item.price
		}, 0)
		addContentToContainer('.js-count-result', totalCost)
	}

	const saveToLocalStorage = () => {
		localStorage.goodsInBasket = JSON.stringify(goodsInBasket)
	}

	const countGoodsInBasket = () => {
		return goodsInBasket.reduce(function(sum, item) {
			return sum + item.count
		}, 0)
	}

	const reloadBasket = () => {
		saveToLocalStorage()
		addGoodToContainer()
		countTotalCost()
	}

	return {
		getLocalSorage: () => {
			if (localStorage.getItem('goodsInBasket') != null)
				goodsInBasket = JSON.parse(localStorage.getItem('goodsInBasket'))
			addGoodToContainer()
			countTotalCost()
		},
		getCountGoodsInBasket: () => {
			addContentToContainer('.js-good-in-basket', countGoodsInBasket())
		},
		addGoodToBasket: good => {
			findGoodAndAdd(good)
			reloadBasket()
		},
		removeGoodFromBasket: id => {
			findGoodAndRemove(id)
			reloadBasket()
		}
	}
}
