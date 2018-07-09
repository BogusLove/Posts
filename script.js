'use strict'

let DATA = [];
let SORTED = [];
window.onload = () => {
	document.getElementById('giveOnly10').addEventListener('click', giveTenPosts);
	document.getElementById('search_input').onkeyup = search;	
	
	getData(true)
		.then(posts => {	
			posts.forEach(singlePost => {
				DATA.push(singlePost);
			});
			SORTED = [...DATA];
			
			localStorage.setItem('postIndex', 0);

			setTags(posts).forEach(tag => createTagBody(tag));

			Array
				.from(document.getElementsByClassName('tag_name'))
				.forEach(tag => {
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
				sortPostsByDate(-1);
				localStorage.setItem('been_here', true);
			} else if (localStorage.getItem('tags_sort')) sortPostsByTags();
		})
		.catch(alert);	
}

window.onscroll = function(e) {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight)) {
		disableScroll();
		render(getHTMLFromArray(get10Posts()));
		enableScroll();
	}		
};

function getData(end = false) {	
	return fetch('https://api.myjson.com/bins/152f9j')
		.then(response => {
			if (response.status !== '200' && response.ok) {
				return response.json();
			}			
		})
		.then(posts => {
			// let position = parseInt(localStorage.getItem('postIndex'));
			// if (!end && position <= posts.data.length - 10) {
			// 	const { data } = posts;
			// 	let arr = [];
			// 	for (let i = position; i < position + 10; i++) {	
			// 		arr.push(data[i]);
			// 	}
			// 	localStorage.setItem('postIndex', position + 10);
			return posts.data;
			// } else if (end) {
			// 	return posts.data;
			// }
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
	const Content = document.getElementById('Content');
	let { image, description, title, createdAt, tags} = post;
	let ul = '';
	tags.forEach(item => { ul += "<li>" + item +"</li>"});
	let body = '<div class="post"><img src="' + image + 
	'"><h2>' + title + '</h2><span>' + description + 
	'</span><br><br><span>Date of creation: </span></span>' + createdAt + 
	'</span><br><br>Tags:<ul class="tags">' + ul + '</ul><button class="delete_btn" onClick="deletePost(this)">Delete</button></div>';	
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

function deletePost(event, parent = true){
	parent ? event.parentNode.remove() : event.remove();
}

function giveTenPosts() { 
	location.reload(); 
}

function search(event) {
	const posts = document.getElementsByClassName('post');
	for (let i = 0; i < posts.length; i++) {
		!posts[i].childNodes[1].textContent.toLowerCase().includes(event.target.value) 
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
	SORTED.sort((a, b) => {
		return increase * (Date.parse(b.createdAt) - Date.parse(a.createdAt));
	});
	removeAllChild();
	localStorage.setItem('postIndex', 0);
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

function sortByDate(a,b) {	
	return Date.parse(b.createdAt) - Date.parse(a.createdAt);
}

function getTagsFromPost(post) {
	return Array.from(Array.from(post.getElementsByClassName('tags'))[0].childNodes).map(li => {
		return li = li.textContent;
	});
}

function equalArrays(arr1, arr2) {
	arr1.sort();
	arr2.sort();
	return arr1.toString() == arr2.toString();	
}

function arrayIncludes(post, tag, count) {
	let counter = 0;
	for (let j = 0; j < tag.length; j++) {
		if (post.includes(tag[j])) counter++;
	}
	return counter === count;
}

function sortPostsByTags() {
	const sort_tags = localStorage.getItem('tags_sort').split(' ');
	let arr = [];
	let arr1 = [];
	let arr2 = [];
	let arr3 = [];
	let arr4 = [];
	let arr5 = [];
	let arr6 = [];
	let rest = [];
	if (sort_tags.length === 0) location.reload();

	if (sort_tags.length === 1) {
		DATA.forEach(post => {
			const post_tags = post.tags;
			if (post_tags.length === 1) {
				if (post_tags.includes(sort_tags[0])) arr1.push(post);
				else rest.push(post);
			} 
			if (post_tags.length === 2) {
				if (post_tags.includes(sort_tags[0])) arr2.push(post);
				else rest.push(post);
			}  
			if (post_tags.length === 3) {
				if (post_tags.includes(sort_tags[0])) arr3.push(post);
				else rest.push(post);
			}
		});
		arr1.sort(sortByDate);
		arr2.sort(sortByDate);
		arr3.sort(sortByDate);
		rest.sort(sortByDate);
		SORTED = [...arr1.concat(arr2.concat(arr3.concat(rest)))];
	}

	if (sort_tags.length === 2) {	
		DATA.forEach(post => {
			const post_tags = post.tags;
			if (post_tags.length === 2) {
				if (equalArrays(sort_tags, post_tags)) arr1.push(post);
				else if (post_tags.includes(sort_tags[0]) || post_tags.includes(sort_tags[1])) arr4.push(post);
				else rest.push(post);
			}	
			if (post_tags.length === 3) {
				if (post_tags.includes(sort_tags[0]) && post_tags.includes(sort_tags[1])) arr2.push(post);
				else if (post_tags.includes(sort_tags[0]) || post_tags.includes(sort_tags[1])) arr5.push(post);
				else rest.push(post);
			}
			if (post_tags.length === 1) {
				if (post_tags.includes(sort_tags[0]) || post_tags.includes(sort_tags[1])) arr3.push(post);
				else rest.push(post);
			}	
		})		
		arr1.sort(sortByDate);
		arr2.sort(sortByDate);
		arr3.sort(sortByDate);
		arr4.sort(sortByDate);
		arr5.sort(sortByDate);
		rest.sort(sortByDate);
		SORTED = [...arr1.concat(arr2.concat(arr3.concat(arr4.concat(arr5.concat(rest)))))];				
	}

	if (sort_tags.length === 3) {
		DATA.forEach(post => {
			const post_tags = post.tags;
			if (post_tags.length === 3) {
				if (equalArrays(sort_tags, post_tags)) arr1.push(post);
				else if (arrayIncludes(post_tags, sort_tags, 2)) arr3.push(post);
				else if (arrayIncludes(post_tags, sort_tags, 1)) arr6.push(post);
				else rest.push(post); 
			}
			if (post_tags.length === 2) {
				if (arrayIncludes(post_tags, sort_tags, 2)) arr2.push(post);
				else if (arrayIncludes(post_tags, sort_tags, 1)) arr5.push(post);
				else rest.push(post);
			}
			if (post_tags.length === 1) {
				if (arrayIncludes(post_tags, sort_tags, 1)) arr4.push(post);
				else rest.push(post);
			}		
			arr1.sort(sortByDate);
			arr2.sort(sortByDate);
			arr3.sort(sortByDate);
			arr4.sort(sortByDate);
			arr5.sort(sortByDate);
			arr6.sort(sortByDate);
			rest.sort(sortByDate);
			SORTED = [...arr1.concat(arr2.concat(arr3.concat(arr4.concat(arr5.concat(arr6.concat(rest))))))];
		});
	}

	if (sort_tags.length > 3) {
		DATA.forEach(post => {
			const post_tags = post.tags;
			if (post_tags.length === 3) {
				if (arrayIncludes(sort_tags, post_tags, 3)) arr1.push(post);
				else if (arrayIncludes(post_tags, sort_tags, 2)) arr3.push(post);
				else if (arrayIncludes(post_tags, sort_tags, 1)) arr6.push(post);
				else rest.push(post); 
			}
			if (post_tags.length === 2) {
				if (arrayIncludes(post_tags, sort_tags, 2)) arr2.push(post);
				else if (arrayIncludes(post_tags, sort_tags, 1)) arr5.push(post);
				else rest.push(post);
			}
			if (post_tags.length === 1) {
				if (arrayIncludes(post_tags, sort_tags, 1)) arr4.push(post);
				else rest.push(post);
			}		
			arr1.sort(sortByDate);
			arr2.sort(sortByDate);
			arr3.sort(sortByDate);
			arr4.sort(sortByDate);
			arr5.sort(sortByDate);
			arr6.sort(sortByDate);
			rest.sort(sortByDate);
			SORTED = [...arr1.concat(arr2.concat(arr3.concat(arr4.concat(arr5.concat(arr6.concat(rest))))))];
		});			
	}

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