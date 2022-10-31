import { useState } from 'react';
import { useCSVDownloader } from 'react-papaparse';
import { toast } from 'react-toastify';
import isURL from 'validator/lib/isURL';
import moment from 'moment';
import Spinner from './spinner/Spinner';

export default function Form() {
	const { CSVDownloader, Type } = useCSVDownloader();

	const [blogs, setBlogs] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const [form, setForm] = useState({
		website: '',
		articleSelector: '',
		blogQuantity: 20,
	});

	const { website, articleSelector, blogQuantity } = form;

	// function that update the form state
	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm({ ...form, [name]: value });
	};

	const cheerio = require('cheerio');

	const scrapeBlog = async (url, selector, proxy) => {
		const data = await fetch(proxy + website + url);
		const response = await data.text();
		const $ = cheerio.load(response);
		const article = $(selector).html();
		return article;
	};

	const createFile = async (e) => {
		e.preventDefault();

		if (website.trim() === '') {
			toast.error('Website field is empty');
			return;
		}

		if (articleSelector.trim() === '') {
			toast.error('Website selector field is empty');
			return;
		}

		if (!isURL(website)) {
			toast.error('Website field is not a valid URL');
		}

		if (blogQuantity <= 0) {
			toast.error('Blog quantity not valid');
		}

		setIsLoading(true);
		let blogsObject = [];

		try {
			var proxyUrl = 'https://murmuring-peak-33067.herokuapp.com/',
				apiUrl = `${form.website}/api/v1/blogs.json?per_page=${form.blogQuantity}`;
			const response = await fetch(proxyUrl + apiUrl);
			const result = await response.json();
			const blogsApi = result.blogs;

			blogsApi.forEach(async (blog) => {
				blog['tag_list'] = blog['tag_list'].split('|').join(',');
				blog['publish_date'] = moment(blog['publish_date']).format(
					'YYYY-MM-DD HH:mm:ss'
				);

				const { title, image, author, publish_date, tag_list, url } = blog;

				const article = await scrapeBlog(url, articleSelector, proxyUrl);

				const blogObject = {
					title: title,
					body: article,
					image: image,
					author_name: author,
					author_image: '',
					language: '',
					publish_date: publish_date,
					tags: tag_list,
				};

				blogsObject.push(blogObject);
				setBlogs(blogsObject);
			});

			setIsLoading(false);
		} catch (error) {
			setIsLoading(false);
			toast.error(error.message);
		}
	};

	return (
		<div className="border border-[#23395d] rounded-md p-5 text-white">
			<h2 className="text-2xl border-b">How to use:</h2>
			<ol className="list-decimal mt-5 px-5">
				<li className="mb-2">Type a website URL</li>
				<li className="mb-2">
					Type the article selector. <br />
					<a
						className="underline hover:text-[orange]"
						href="https://drive.google.com/file/d/1KNgsaDQGMhBdTU9yOTwjncG-qngmmPXF/view"
						target="_blank"
						rel="noreferrer"
					>
						How can I do this?
					</a>
				</li>
				<li className="mb-2">
					How many blogs would you like to download? (optional) <br />
				</li>
				<li className="mb-2">Create CSV File.</li>
				<li>Download your file.</li>
			</ol>

			<form className="mt-4">
				<div>
					<label htmlFor="website" className="mb-2 block">
						Website:
					</label>
					<input
						className="d-block w-full mb-3 px-3 py-2 rounded-md text-slate-900 bg-slate-200 focus-visible:border-[orange]"
						type="url"
						id="website"
						name="website"
						placeholder="https://www.volcanic.com"
						onChange={handleChange}
					/>
				</div>
				<div>
					<label htmlFor="selector" className="mb-2 block">
						Article selector:
					</label>
					<input
						className="d-block w-full mb-3 px-3 py-2 rounded-md text-slate-900 bg-slate-200 focus-visible:border-[orange]"
						type="text"
						name="articleSelector"
						id="selector"
						placeholder="#blog .container article"
						onChange={handleChange}
					/>
				</div>
				<div>
					<label htmlFor="blogs" className="mb-2 block">
						How many blogs?
					</label>
					<input
						className="d-block w-full px-3 py-2 rounded-md text-slate-900 bg-slate-200 focus-visible:border-[orange]"
						type="number"
						name="blogQuantity"
						id="blogs"
						placeholder="20"
						min="0"
						onChange={handleChange}
					/>
				</div>
				<div className="mt-3 flex flex-col items-start">
					<button
						className="rounded-md bg-orange-500 px-4 py-3 mt-4 inline-block cursor-pointer hover:bg-orange-600 transition-colors"
						onClick={createFile}
					>
						Create file
					</button>

					{isLoading && <Spinner />}

					{blogs.length > 0 && (
						<CSVDownloader
							data={blogs}
							filename={'blogs'}
							type={Type.Link}
							className="rounded-md bg-orange-500 px-4 py-3 mt-4 inline-block cursor-pointer hover:bg-orange-600 transition-colors"
						>
							Download
						</CSVDownloader>
					)}
					{}
				</div>
			</form>
		</div>
	);
}
