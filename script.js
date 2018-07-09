'use strict'

let DATA = [];
let SORTED = [];
window.onload = () => {
	document.getElementById('giveOnly10').addEventListener('click', giveTenPosts);
	document.getElementById('search_input').onkeyup = search;		
	getData().then(posts => {	
		DATA = [...posts];
		SORTED = [...DATA];
		localStorage.setItem('postIndex', 0);
		setTags(posts).forEach(tag => createTagBody(tag));
		Array.from(document.getElementsByClassName('tag_name')).forEach(tag => {
			tag.addEventListener('click', tagsClick);
			if (localStorage.getItem('tags_sort')) {
				const saved_tags = localStorage.getItem('tags_sort').split(' ');
				for (let i = 0; i < saved_tags.length; i++) {
					if (tag.id === saved_tags[i]) tag.checked = true;
				}
			}
		})
		render(getHTMLFromArray(get10Posts()));
		if (!localStorage.getItem('been_here')) {
			sortPostsByDate();
			localStorage.setItem('been_here', true);
		} else if (localStorage.getItem('tags_sort')) sortPostsByTags();
	}).catch(alert);
}

window.onscroll = function(e) {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight)) {
		disableScroll();
		render(getHTMLFromArray(get10Posts()));
		enableScroll();
	}		
};

function getData() {	
	return fetch('https://api.myjson.com/bins/152f9j')
		.then(response => {
			if (response.status !== '200' && response.ok) {
				return response.json();
			}			
		})
		.then(posts => {
			return posts.data;
		})
		.catch(alert);
}

function get10Posts() {
	let position = parseInt(localStorage.getItem('postIndex'));
	let arr = [];
	if (position <= SORTED.length - 10) {
		arr = SORTED.slice(position, position + 10);
		localStorage.setItem('postIndex', position + 10);
	}
	return arr;
}

function createPostBody(post){
	let { image, description, title, createdAt, tags} = post;
	let ul = '';
	tags.forEach(item => { ul += "<li>" + item +"</li>"});
	let body = '<div class="post" id="' + title + '"><img src="' + image + 
	'"><h2>' + title + '</h2><span>' + description + 
	'</span><br><br><span>Date of creation: </span></span>' + createdAt + 
	'</span><br><br>Tags:<ul class="tags">' + ul + '</ul><button class="delete_btn" onClick="deletePost(this)">Delete</button><br></div>';	
	return body;
}

function createTagBody(tag) {
	const tags = document.getElementById('tag_sort');
	let body = '<div class="tag"><input type="checkbox" class="tag_name" id="' + tag + '"></input><label for="' + tag + '">' + tag + '</label></div>';
	tags.insertAdjacentHTML('beforeend', body);
}

function getHTMLFromArray(arr) {
	let newArr = [];
	for (let i = 0; i < arr.length; i++) {
		newArr.push(createPostBody(arr[i]));
	}	
	return newArr;
}

function deletePost(event) {
	event.parentNode.remove();
	SORTED.splice([SORTED.indexOf(SORTED.find(item => {return item.title === event.parentNode.id}))], 1);
}

function giveTenPosts() { 
	location.reload(); 
}

function search(event) {
	const posts = document.getElementsByClassName('post');
	for (let i = 0; i < posts.length; i++) {
		!posts[i].childNodes[1].textContent.toLowerCase().includes(event.target.value.toLowerCase())
			? posts[i].style.display = 'none' 
			: posts[i].style.display = 'block';
	}
}

function setTags(posts) {
	let arr = [];
	posts.forEach(item => {		
		item.tags.forEach(tag => {
			!arr.includes(tag) ? arr.push(tag) : 0;
		});	
	});
	return arr.sort();
}

function tagsClick(event) {
	const newTag = event.target.id;
	const current_tags = localStorage.getItem('tags_sort');
	if (event.target.checked) {
		current_tags === '' || current_tags === null || current_tags === undefined
			?  localStorage.setItem('tags_sort', newTag) 
			: localStorage.setItem('tags_sort', current_tags + ' ' + newTag);
		sortPostsByTags();
	} else {
		const tags = localStorage.getItem('tags_sort').split(' ');
		tags.splice(tags.indexOf(newTag), 1);
		localStorage.setItem('tags_sort', tags.join(' '));
		localStorage.getItem('tags_sort').length > 0 ? sortPostsByTags() : sortPostsByDate();
	}
}

function sortPostsByDate(increase = 1) {	
	Array.from(document.getElementsByClassName('tag_name')).forEach(tag => { tag.checked = false })
	SORTED.sort((a, b) => {	return increase * (Date.parse(b.createdAt) - Date.parse(a.createdAt)) });
	removeAllChild();
	localStorage.setItem('postIndex', 0);
	localStorage.setItem('tags_sort', '');
	render(getHTMLFromArray(get10Posts()));
}

function render(arr) {	
	const content = document.getElementById('Content');
	for (let i = 0; i < arr.length; i++) {
		content.insertAdjacentHTML('beforeend', arr[i]);
	}
}

function removeAllChild() {
	const content = document.getElementById('Content');
	while (content.firstChild) {
		content.removeChild(content.firstChild);
	}
}

function countOfIncludes(post, tag) {
	let counter = 0;
	for (let i = 0; i < tag.length; i++) {
		for (let j = 0; j < post.length; j++) {
			if (tag[j] === post[i]) counter++;
		}
	}
	return counter;
} 

function sortPostsByTags() {
	const sort_tags = localStorage.getItem('tags_sort').split(' ');
	SORTED.map(post => { post.percent = Math.pow(countOfIncludes(post.tags, sort_tags), 2) / (sort_tags.length * post.tags.length) * 100 });
	SORTED.sort((a, b) => { return b.percent - a.percent });
	SORTED.sort((a, b) => { if (a.percent === b.percent) return (Date.parse(b.createdAt) - Date.parse(a.createdAt)) });
	SORTED.map(item => { delete item.percent });
	removeAllChild();
	localStorage.setItem('postIndex', 0);
	render(getHTMLFromArray(get10Posts()));
}

function disableScroll() {		
	window.onwheel = preventDefault; 
	window.scrollTo(0, 2 * window.scrollY);
}

function enableScroll() {	
	window.onwheel = null; 
}

function preventDefault(e) {
	e = e || window.event;
	if (e.preventDefault) e.preventDefault();
	e.returnValue = false;  	
}