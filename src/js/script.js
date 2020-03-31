// товары
class Goods {
	constructor() {
		this._goodsInPage = [];
		this._avaliable = false;
		this._sortingValue = 'name';
	}

	_sortingAvaliable(goods) {
		return goods.filter(elem => elem.avaliable);
	}

	_sortingByCost(goods) {
		return goods.sort((prev, next) => prev.price - next.price);
	}

	_sortingByName(goods) {
		return goods.sort((prev, next) => {
			const x = prev.title.toLowerCase();
			const y = next.title.toLowerCase();
			if (x < y) return -1;
			if (x < y) return 1;
		});
	}

	_sorting(goods) {
		if (this._avaliable) goods = this._sortingAvaliable(goods);

		if (this._sortingValue == 'cost') goods = this._sortingByCost(goods);
		else if (this._sortingValue == 'name') goods = this._sortingByName(goods);
		return goods;
	}

	_truncate(descr, maxLength) {
		if (descr.length > maxLength) {
			let gap = descr.lastIndexOf(' ', maxLength);
			return `${descr.slice(0, gap)} ...`;
		}
		return descr;
	}

	_getGoodContent(good) {
		let { id, image, title, price, descr } = good;
		return `<div class="good__item js-good-item" data-good-id=${id}>
					<div class="good__image"><img src="${image}"/></div>
					<div class="good__information">
						<div class="good__title">${title}</div>
						<div class="good__price">${price} руб</div>
						<div class="good__description">${this._truncate(descr, 65)}</div>
					</div>
					<div class="good__transaction">
						<button class="good__button js-add-to-basket">Добавить в корзину</button>
						<div class="good__basket-feedback js-good-in-basket"></div>
					</div>
				</div>`;
	}

	_addGoodsToContainer(goods) {
		this._goodsInPage = goods;
		const goodsContent = goods.map(good => this._getGoodContent(good)).join('');
		addContentToContainer('.js-good', goodsContent);
	}

	loadGoods() {
		fetch('https://dzadranik.github.io/goods-and-basket/src/json/goods.json')
			.then(response => response.json())
			.then(goods => {
				this._addGoodsToContainer(goodsPaging.addPagingGetItemsInPage(this._sorting(goods)));
			});
	}

	setAvaliable(value) {
		this._avaliable = value;
		goodsPaging.setActivePage(0);
		this.loadGoods();
	}

	setSorting(value) {
		if (this._sortingValue != value) {
			this._sortingValue = value;
			this.loadGoods();
		}
	}

	getGoodInformation(id) {
		return this._goodsInPage.find(item => item.id == id);
	}
}

//корзина
class Basket {
	constructor() {
		this._goodsInBasket = [];
	}

	_getGoodContent(good) {
		let { id, image, title, count } = good;
		return `<div class="basket__good-item" data-b-good-id="${id}">
			<button class="basket__good-remove js-remove-good">&#128938;</button>
			<div class="basket__good-image"><img src="${image}"/></div>
			<div class="basket__good-name">${title}</div>
			<div class="basket__good-amout">${count}</div>
		</div>`;
	}

	_addGoodToContainer() {
		let goodsContent = this._goodsInBasket.map(good => this._getGoodContent(good)).join('');
		addContentToContainer('.js-basket-good', goodsContent);
	}

	_findGoodAndRemove(id) {
		let goodIndex = this._goodsInBasket.findIndex(item => item.id === +id);
		this._goodsInBasket.splice(goodIndex, 1);
	}

	_findGoodAndAdd(good) {
		let goodInBasket = this._goodsInBasket.find(item => item.id === good.id);
		if (goodInBasket) {
			goodInBasket.count++;
		} else {
			good.count = 1;
			this._goodsInBasket = [...this._goodsInBasket, good];
		}
	}

	_countTotalCost() {
		let totalCost = this._goodsInBasket.reduce((sum, item) => sum + item.count * item.price, 0);
		addContentToContainer('.js-count-result', totalCost);
	}

	_saveToLocalStorage() {
		localStorage.goodsInBasket = JSON.stringify(this._goodsInBasket);
	}

	_countGoodsInBasket() {
		return this._goodsInBasket.reduce((sum, item) => sum + item.count, 0);
	}

	_reloadBasket() {
		this._saveToLocalStorage();
		this._addGoodToContainer();
		this._countTotalCost();
	}

	getLocalSorage() {
		if (localStorage.getItem('goodsInBasket') != null)
			this._goodsInBasket = JSON.parse(localStorage.getItem('goodsInBasket'));
		this._addGoodToContainer();
		this._countTotalCost();
	}

	getCountGoodsInBasket() {
		addContentToContainer('.js-good-in-basket', this._countGoodsInBasket());
	}

	addGoodToBasket(good) {
		this._findGoodAndAdd(good);
		this._reloadBasket();
	}

	removeGoodFromBasket(id) {
		this._findGoodAndRemove(id);
		this._reloadBasket();
	}
}

//пагинация
class Paging {
	constructor(amountPageItems, container) {
		this._container = container;
		this._amountPageItems = amountPageItems;
		this._activePage = 0;
	}

	_getPButtonContent(number) {
		return `<button 
					class="pagination__button js-pagination-button 
					${number === this._activePage ? 'active' : ''}" 
					data-p-button-number="${number + 1}">
						${number + 1}
				</button>`;
	}

	_getPDotsContent() {
		return `<span class='pagination__dots'>...</span>`;
	}

	_getPButtonsNumberContent(first, last, pButtonsContent = '') {
		if (first < last) {
			pButtonsContent += this._getPButtonContent(first);
			return this._getPButtonsNumberContent(first + 1, last, pButtonsContent);
		}
		return pButtonsContent;
	}

	_getPButtonsContent(items) {
		let amountButtons = Math.ceil(items.length / this._amountPageItems), // количество страниц
			pButtonsContent = ''; // разметка кнопок пагинации

		if (amountButtons > 6) {
			if (this._activePage < 2 || this._activePage > amountButtons - 3) {
				pButtonsContent += this._getPButtonsNumberContent(0, 3);
				pButtonsContent += this._getPDotsContent();
				pButtonsContent += this._getPButtonsNumberContent(amountButtons - 3, amountButtons);
			} else if (this._activePage == 2) {
				pButtonsContent += this._getPButtonsNumberContent(0, 4);
				pButtonsContent += this._getPDotsContent();
				pButtonsContent += this._getPButtonsNumberContent(amountButtons - 1, amountButtons);
			} else if (this._activePage == amountButtons - 3) {
				pButtonsContent += this._getPButtonsNumberContent(0, 1);
				pButtonsContent += this._getPDotsContent();
				pButtonsContent += this._getPButtonsNumberContent(amountButtons - 4, amountButtons);
			} else if (this._activePage > 2 && this._activePage < amountButtons - 3) {
				pButtonsContent += this._getPButtonsNumberContent(0, 1);
				pButtonsContent += this._getPDotsContent();
				pButtonsContent += this._getPButtonsNumberContent(this._activePage - 1, this._activePage + 2);
				pButtonsContent += this._getPDotsContent();
				pButtonsContent += this._getPButtonsNumberContent(amountButtons - 1, amountButtons);
			}
		} else {
			pButtonsContent += this._getPButtonsNumberContent(0, amountButtons);
		}
		return pButtonsContent;
	}

	_getItemsInActivePage(items) {
		const firstItem = this._activePage * this._amountPageItems,
			lastItem = firstItem + this._amountPageItems;
		return items.slice(firstItem, lastItem);
	}

	setActivePage(number) {
		this._activePage = number;
	}

	addPagingGetItemsInPage(items) {
		addContentToContainer(this._container, this._getPButtonsContent(items));
		return this._getItemsInActivePage(items);
	}
}

//Добавление элементов в контейнер
function addContentToContainer(containerClass, element) {
	const container = document.querySelector(containerClass);
	if (container) container.innerHTML = element;
}

//удалить класс у группы контейнеров
function findContainersAndRemoveClass(containerClass, className) {
	const removeClassInContainer = (allContainers, className, i = 0) => {
		if (i < allContainers.length) {
			allContainers[i].classList.remove(className);
			return removeClassInContainer(allContainers, className, i + 1);
		}
	};
	let allContainers = document.querySelectorAll(containerClass);
	removeClassInContainer(allContainers, className);
}

document.addEventListener('DOMContentLoaded', function() {
	const handler = (element, eventName, fn) => {
		const elementContainer = document.querySelector(element);
		elementContainer.addEventListener(eventName, event => fn(event));
	};

	//слушалка кнопок пагинатора
	handler('.js-pagination', 'click', event => {
		const targetElement = event.target;
		if (targetElement.classList.contains('js-pagination-button') && !targetElement.classList.contains('active')) {
			goodsPaging.setActivePage(targetElement.dataset.pButtonNumber - 1);
			goods.loadGoods();
		}
	});

	// слушалка сортировок
	handler('.js-sorting-buttons', 'click', event => {
		const targetElement = event.target;
		if (targetElement.classList.contains('js-sorting') && !targetElement.classList.contains('active')) {
			const sortingSetting = targetElement.dataset.sorting;
			findContainersAndRemoveClass('.js-sorting', 'active');
			goods.setSorting(sortingSetting);
			targetElement.classList.add('active');
		}
	});

	// слушалка сортировки по наличию
	handler('.js-avaliable', 'change', event => {
		goods.setAvaliable(event.target.checked);
	});

	// кнопка добавить в корзину
	handler('.js-good', 'click', event => {
		if (event.target.classList.contains('js-add-to-basket')) {
			let goodId = event.target.closest('.js-good-item').dataset.goodId;
			basket.addGoodToBasket(goods.getGoodInformation(goodId));
		}
	});

	// кнопка удалить из корзины
	handler('.js-basket-good', 'click', event => {
		if (event.target.classList.contains('js-remove-good')) {
			basket.removeGoodFromBasket(event.target.parentElement.dataset.bGoodId);
		}
	});
});

const basket = new Basket(),
	goods = new Goods(),
	goodsPaging = new Paging(5, '.js-pagination');

goods.loadGoods();
basket.getLocalSorage();
