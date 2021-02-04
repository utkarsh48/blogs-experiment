let wrapper = document.querySelector(".blog-wrapper");
//showdown + extensions initilization
let converter = new showdown.Converter({
	extensions: ['youtube']
});
converter.setFlavor('github');



getAllArticles(0, superTop);








//functions
async function getAllArticles(lowerLimit, upperLimit) {
	//clearing previous content
	clearWrapper();

	//parent element
	let bulkParent = document.createElement("section");
	bulkParent.classList.add("bulk-meta-data");

	//array
	let bulkMap = new Map();

	//2 loops need a workaround this
	for (counter=upperLimit-1; counter>=lowerLimit; counter--) {

		bulkMap.set(counter,
			new Promise((resolve, reject)=>{
				fetch(`/blogs/blog${counter}.json`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(data=>data.json())
				.then(result=>resolve(result))
				.catch(er=>reject(er));
			})
		);

	}

	for(let blogIndex of bulkMap){
		let count = blogIndex[0],
		result = await blogIndex[1];

		//validate json
		if(!validateJsonObject(result)) break;

		let tempElement = document.createElement("article");

		tempElement.classList.add("bulk-blog");
		tempElement.dataset["count"] = count;
		tempElement.innerHTML=`<h1 class="bulk-blog-heading">${result.heading}</h1> <h2 class="bulk-blog-author">${result.author}</h2> <p class="bulk-blog-tags-parent">${tagsToSpans(result.tags, "bulk-blog-tag")}</p> <p class="bulk-blog-date">${result.date}</p>`;

		tempElement.addEventListener("click", (e)=>{
			let blogCount = e.currentTarget.dataset["count"];
			getArticle(blogCount);
		});

		bulkParent.appendChild(tempElement);
	}

	wrapper.appendChild(bulkParent);
}

async function getArticle(blogCount = 0) {
	//clearing previous content
	let url = `/blogs/blog${blogCount}`;
	clearWrapper();

	//fetching data to render
	let fetchedMetaData = await fetch(url+".json", {
		headers:{
			'Content-Type': 'application/json'
		}
	});

	let fetchedData = await fetch(url+".md", {
		headers:{
			'Content-Type': 'text/plain'
		}
	});

	//if not found
	if(fetchedData.status==404 || fetchedMetaData.status==404){
		errorOccured("404 Not Found");
		return;
	}

	let metaData = await fetchedMetaData.json(),
	data = await fetchedData.text(),
	content = converter.makeHtml(data);

	//validate json
	if(!validateJsonObject(metaData)){
		errorOccured("Can't verify signature");
		return;
	}

	let blog = document.createElement("article");
	blog.classList.add("blog");
	
	//rendering
	blog.innerHTML = `<section class="blog-meta-data"> <h1 class="blog-heading">${metaData.heading}</h1>	<div class="blog-data"> <span class="blog-date">${metaData.date}</span> <span class="blog-author">${metaData.author}</span> </div> <section class="blog-tags">${tagsToSpans(metaData.tags, "blog-tag")}</section> </section> ${content}`;

	wrapper.appendChild(blog);

	//post rendering
	//mermaid flowcharts
	mermaid.init();

	//highlight.js
	blog.querySelectorAll("code").forEach(elem=>{
		hljs.highlightBlock(elem);
	});

	//post render
	//responsive tables
	[...document.querySelectorAll("table")].map(table=>{
		let tempParent = document.createElement("div");
		tempParent.classList.add("blog-table-parent");

		let tempTable = document.createElement("table");
		
		tempTable.innerHTML=table.innerHTML;

		tempParent.appendChild(tempTable);
		table.replaceWith(tempParent);
	});
}

function clearWrapper() {
	while(wrapper.hasChildNodes()){
		wrapper.removeChild(wrapper.lastChild);
	}
}

function validateJsonObject(object){
	return object.heading!=null && object.author!=null && object.tags!=null && object.date!=null;
}

function tagsToSpans(tags, className0){
	return [...tags.split(" ")].map(tag=>`<span class="${className0}">${tag}</span>`).join(" ");
}

function errorOccured(etext) {
	let errorParent = document.createElement("article");
	errorParent.classList.add("error-parent");
	let errorText = document.createElement("div");
	errorText.classList.add("error-text");
	errorText.innerText=etext;
	let reloadAllArticles = document.createElement("div");
	reloadAllArticles.classList.add("reload-all-articles");
	reloadAllArticles.innerText="All blogs";

	reloadAllArticles.addEventListener("click", (e)=>{
		getAllArticles(0, superTop);
	});

	errorParent.append(errorText, reloadAllArticles);
	wrapper.appendChild(errorParent);

}