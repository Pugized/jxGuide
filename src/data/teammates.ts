export interface Teammate {
	id: string;
	name: string;
	realname: string;
	tags: string[];
	description: string;
	avatar: string;
	bg?: string;
}

const teammates: Teammate[] = [
	{
		id: 'xt',
		name: '百分之摆',
		realname: '徐图',
		tags: ['队长'],
		description: '统筹安排，组织队员',
		avatar: new URL('../assets/xt.jpg', import.meta.url).href,
		bg: new URL('../assets/x.jpg', import.meta.url).href
	},
	{
		id: 'tjy',
		name: '星源',
		realname: '谭景元',
		tags: ['前端设计', '后端开发'],
		description: '软件技术开发',
		avatar: new URL('../assets/strc_img.jpg', import.meta.url).href,
		bg: new URL('../assets/star_clip.jpg', import.meta.url).href
	},
	{
		id: 'sy',
		name: '浸有NaCl\n溶液的铁粉',
		realname: '沈仲仪',
		tags: ['硬件开发'],
		description: '负责硬件购置、设计',
		avatar: new URL('../assets/EncVar.png', import.meta.url).href,
		bg: ''
	}
];

export default teammates;
