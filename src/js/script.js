var { addGoodToBasket, getLocalSorage, removeGoodFromBasket, countGoodInBasket } = basketSetting(),
	{ addPaging, setActivePage } = paging(),
	{ loadGoodToPage, setAvaliable, setSorting, returnGoodData } = goodSetting(),
	{ findContainerAndRemoveClass } = containerClassSetting()

document.addEventListener('DOMContentLoaded', function() {
	const paginationButtonContainer = document.querySelector('.js-pagination'),
		sortingButtonContainer = document.querySelector('.js-sorting-buttons'),
		avaliableCheckbox = document.getElementById('avaliable'),
		goodContainer = document.querySelector('.js-good'),
		basketGoodContainer = document.querySelector('.js-basket-good')

	//слушалка кнопок пагинатора
	paginationButtonContainer.addEventListener('click', event => {
		const targetElement = event.target
		if (targetElement.classList.contains('js-pagination-button') && !targetElement.classList.contains('active')) {
			setActivePage(targetElement.getAttribute('id') - 1)
		}
	})

	// слушалка сортировок
	sortingButtonContainer.addEventListener('click', event => {
		const targetElement = event.target,
			sortingSetting = targetElement.getAttribute('sorting-setting')
		if (targetElement.classList.contains('js-sorting') && !targetElement.classList.contains('active')) {
			findContainerAndRemoveClass('.js-sorting', 'active')
			setSorting(sortingSetting)
			targetElement.classList.add('active')
		}
	})

	// слушалка сортировки по наличию
	avaliableCheckbox.addEventListener('change', event => {
		setAvaliable(event.target.checked)
	})

	// кнопка добавить в корзину
	goodContainer.addEventListener('click', event => {
		if (event.target.classList.contains('good__button')) {
			let goodId = event.target.parentElement.parentElement.getAttribute('good-id')
			let goodData = returnGoodData(goodId)
			addGoodToBasket(goodData)
		}
	})

	// кнопка удалить из корзины
	basketGoodContainer.addEventListener('click', event => {
		const targetElement = event.target
		if (targetElement.classList.contains('js-remove-good')) {
			let goodId = targetElement.parentElement.getAttribute('basket-good-id')
			removeGoodFromBasket(goodId)
		}
	})
})

loadGoodToPage()
getLocalSorage()

//Добавление элементов в контейнер
function addToContainer(containerClass, element) {
	const container = document.querySelector(containerClass)
	if (container) container.innerHTML = element
}
function addToAnyContainers(containerClass, element) {
	const container = document.querySelectorAll(containerClass)
	if (container) {
		for (let i = 0; i < container.length; i++) {
			container[i].innerHTML = element
		}
	}
}

//удалить класс у группы контейнеров
function containerClassSetting() {
	var allContainer, classToRemove
	const removeClassInContainer = (i = 0) => {
		if (i < allContainer.length) {
			allContainer[i].classList.remove(classToRemove)
			return removeClassInContainer(i + 1)
		}
	}
	return {
		findContainerAndRemoveClass: (container, className) => {
			allContainer = document.querySelectorAll(container)
			classToRemove = className
			removeClassInContainer()
		}
	}
}

// товары
function goodSetting() {
	var goodData = [],
		avaliable = false,
		sortingValue = 'sorting-name'

	const sortingAvaliable = data => {
		return data.filter(elem => elem.avaliable)
	}

	const sortingByCost = data => {
		return data.sort((prev, next) => prev.price - next.price)
	}

	const sortingByName = data => {
		return data.sort((prev, next) => {
			const x = prev.title.toLowerCase()
			const y = next.title.toLowerCase()
			if (x < y) return -1
			if (x < y) return 1
		})
	}

	const sorting = data => {
		let item = data
		if (avaliable) item = sortingAvaliable(data)

		if (sortingValue == 'sorting-cost') item = sortingByCost(item)
		else if (sortingValue == 'sorting-name') item = sortingByName(item)
		return item
	}

	const returnGoodItem = data => {
		let { id, image, title, price, descr } = data
		return `<div class="good__item" good-id=${id}>
					<div class="good__image"><img src="${image}"/></div>
					<div class="good__information">
						<div class="good__title">${title}</div>
						<div class="good__price">${price} руб</div>
						<div class="good__description">${descr}</div>
					</div>
					<div class="good__transaction">
						<button class="good__button">Добавить в корзину</button>
						<div class="good__basket-feedback js-good-in-basket"></div>
					</div>
				</div>`
	}

	function addGoodToContainer(data) {
		goodData = data
		let goodItems = data.map(item => returnGoodItem(item))
		goodItems = goodItems.join('')
		addToContainer('.js-good', goodItems)
	}

	return {
		loadGoodToPage: () => {
			fetch('js/goods.json')
				.then(response => response.json())
				.then(data => sorting(data))
				.then(data => addPaging(data))
				.then(data => {
					addGoodToContainer(data)
					countGoodInBasket()
				})
		},
		setAvaliable: value => {
			avaliable = value
			setActivePage(0)
			loadGoodToPage()
		},
		setSorting: value => {
			if (sortingValue != value) {
				sortingValue = value
				loadGoodToPage()
			}
		},
		returnGoodData: id => {
			return goodData.find(item => item.id == id)
		}
	}
}

//пагинация
function paging() {
	const itemInPage = 15 // количество элементов на странице
	var activePage = 0 // активная страница

	const returnPagingButton = i => {
		return `<button 
			class="pagination__item js-pagination-button ${i == activePage ? 'active' : ''}" 
			id="${i + 1}">
				${i + 1}
			</button>`
	}

	const returnPagingDots = () => {
		return `<span class='pagination__dots'>...</span>`
	}

	const returnAnyPagingButtons = (frst, last) => {
		let pagingButtons = ''
		for (let i = frst; i < last; i++) {
			pagingButtons += returnPagingButton(i)
		}
		return pagingButtons
	}

	const returnPagingButtons = data => {
		var item = data, // массив товаров
			amountItem = item.length, // количество товаров всего
			amountButton = Math.ceil(amountItem / itemInPage), // количество страниц
			pagingButtons = '' // разметка кнопок пагинации

		if (amountButton > 6) {
			if (activePage < 2 || activePage > amountButton - 3) {
				pagingButtons += returnAnyPagingButtons(0, 3)
				pagingButtons += returnPagingDots()
				pagingButtons += returnAnyPagingButtons(amountButton - 3, amountButton)
			} else if (activePage == 2) {
				pagingButtons += returnAnyPagingButtons(0, 4)
				pagingButtons += returnPagingDots()
				pagingButtons += returnAnyPagingButtons(amountButton - 1, amountButton)
			} else if (activePage == amountButton - 3) {
				pagingButtons += returnAnyPagingButtons(0, 1)
				pagingButtons += returnPagingDots()
				pagingButtons += returnAnyPagingButtons(amountButton - 4, amountButton)
			} else if (activePage > 2 && activePage < amountButton - 3) {
				pagingButtons += returnAnyPagingButtons(0, 1)
				pagingButtons += returnPagingDots()
				pagingButtons += returnAnyPagingButtons(activePage - 1, activePage + 2)
				pagingButtons += returnPagingDots()
				pagingButtons += returnAnyPagingButtons(amountButton - 1, amountButton)
			}
		} else {
			pagingButtons += returnAnyPagingButtons(0, amountButton)
		}
		return pagingButtons
	}

	const returnItemInActivePage = data => {
		const firstItem = activePage * itemInPage,
			lastItem = firstItem + itemInPage
		return data.slice(firstItem, lastItem)
	}

	return {
		setActivePage: i => {
			activePage = i
			loadGoodToPage()
		},
		addPaging: data => {
			addToContainer('.js-pagination', returnPagingButtons(data))
			return returnItemInActivePage(data)
		}
	}
}

//корзина
function basketSetting() {
	var goodInBasket = []

	const returnBasketGoodItem = data => {
		let { id, image, title, count } = data
		return `<div class="basket__good-item" basket-good-id="${id}">
			<button class="basket__good-remove js-remove-good">&#128938;</button>
			<div class="basket__good-image"><img src="${image}" /></div>
			<div class="basket__good-name">${title}</div>
			<div class="basket__good-amout">${count}</div>
		</div>`
	}

	const addGoodToContainer = () => {
		let goodArray = goodInBasket.map(element => returnBasketGoodItem(element))
		goodArray = goodArray.join('')
		addToContainer('.js-basket-good', goodArray)
	}

	const findGoodAndRemove = (id, i = 0) => {
		return i < goodInBasket.length || id !== goodInBasket[i].id ? goodInBasket.splice(i, 1) : findGoodAndRemove(i++)
	}

	const countTotal = () => {
		let totalCost = goodInBasket.reduce(function(sum, item) {
			return sum + item.count * item.price
		}, 0)
		addToContainer('.js-count-result', totalCost)
	}

	const saveToLocalStorage = () => {
		localStorage.goodInBasket = JSON.stringify(goodInBasket)
	}

	const reloadBasket = () => {
		saveToLocalStorage()
		addGoodToContainer()
		countTotal()
		countGoodInBasket()
	}

	return {
		getLocalSorage: () => {
			if (localStorage.getItem('goodInBasket') != null)
				goodInBasket = JSON.parse(localStorage.getItem('goodInBasket'))
			reloadBasket()
		},
		countGoodInBasket: () => {
			let amountItem = goodInBasket.reduce(function(sum, item) {
				return sum + item.count
			}, 0)
			addToAnyContainers('.js-good-in-basket', `Товаров в корзине  ${amountItem}`)
		},
		addGoodToBasket: data => {
			for (let i = 0; i < goodInBasket.length; i++) {
				if (data.id == goodInBasket[i].id) {
					goodInBasket[i].count++
					reloadBasket()
					return
				}
			}
			data.count = 1
			goodInBasket.push(data)
			reloadBasket()
		},
		removeGoodFromBasket: data => {
			findGoodAndRemove(data)
			reloadBasket()
		}
	}
}
