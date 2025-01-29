import React from 'react';
import Image from 'next/image';
import {Button} from '@/components/ui/Button';
import Link from 'next/link';
const topics=[
    { 
        
        title: 'Python', 
        image: '/images/python.png', 
        desc: 'Python is a programming language that lets you work quickly and integrate systems more effectively.',
        slug: 'Python-new', 
      },
      { 
       
        title: 'JavaScript', 
        image: '/images/javascript.webp', 
        desc: 'JavaScript is the programming language of the web. It powers interactive features on websites and is essential for front-end development.', 
     slug: 'Javascript-new',
    },
      { 
        
        title: 'Java', 
        image: '/images/java.png', 
        desc: 'Java is a versatile and robust programming language widely used for developing enterprise applications, Android apps, and more.', 
      slug: 'Java-new',
    },
      { 
       
        title: 'C++', 
        image: '/images/c++.png', 
        desc: 'C++ is a powerful, high-performance language often used for game development, system programming, and high-performance computing.', 
     slug: 'C Plus Plus-new',
    
    },
      { 
      
        title: 'Go', 
        image: '/images/Go.png', 
        desc: 'Go is a modern, open-source language designed for efficiency and simplicity, often used for building scalable and concurrent systems.', 
     
    slug: 'Go-new',
    },
      { 
         
        title: 'Ruby', 
        image: '/images/ruby.png', 
       
     desc: 'Ruby is a dynamic, object-oriented language known for its elegance and developer happiness, often used for web development (Ruby on Rails).', 
    slug: 'Ruby-new',
    }
        ];
const ForumsPage = () => {
    return (
        <div className='container mx-auto my-28' >
            <h1 className='text-2xl text-center font-bold text-black'>Forums</h1>
            
            <div className='flex flex-wrap justify-center'>
                {topics.map((topic) =>{
                    return(
                        <div key={topic.image} className='bg-slate-300 w-1/4 m-4   shadow-lg flex justify-center flex-col items-center py-4 rounded-lg'> 
                        <Image alt='logo'src={topic.image} width={34} height={34} className=''/>
                        <h2 className='text-2xl'>{topic.title}  </h2>
                        <p className='text-center'>{topic.desc}</p>
                      <Link href={`/forum/${topic.slug}`}>
                        <Button className='px-4 border border-slate-500 my-5 py-2'>Discuss Now</Button>
                        </Link>
                       </div>
                    )

                
                })}
               
            </div>
        </div>
    );
};

export default ForumsPage;


// import React from 'react';
// import Image from 'next/image';
// import { Button } from '@/components/ui/Button';
// import Link from 'next/link';

// const topics = [
//   { 
//     id: 1, 
//     title: 'Python', 
//     image: '/python.jpg', 
//     desc: 'Python is a programming language that lets you work quickly and integrate systems more effectively.',
//     slug: 'python', 
//   },
//   { 
//     id: 2, 
//     title: 'JavaScript', 
//     image: '/javascript.webp', 
//     desc: 'JavaScript is the programming language of the web. It powers interactive features on websites and is essential for front-end development.', 
//     slug: 'javascript',
//   },
//   { 
//     id: 3, 
//     title: 'Java', 
//     image: '/java.jpg', 
//     desc: 'Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible.',
//     slug: 'java', 
//   },
//   { 
//     id: 4, 
//     title: 'C++', 
//     image: '/cpp.jpg', 
//     desc: 'C++ is a general-purpose programming language created as an extension of the C programming language, or "C with Classes".',
//     slug: 'cpp', 
//   },
//   { 
//     id: 5, 
//     title: 'Ruby', 
//     image: '/ruby.jpg', 
//     desc: 'Ruby is an interpreted, high-level, general-purpose programming language. It is dynamically typed and uses garbage collection.',
//     slug: 'ruby', 
//   },
// ];

// const ForumsPage = () => {
//   return (
//     <div className='flex flex-wrap justify-center'>
//       {topics.map((topic) => (
//         <div key={topic.id} className='bg-slate-500 w-1/4 m-4 shadow-lg flex justify-center flex-col items-center py-4 rounded-lg'>
//           <Image alt='logo' src={topic.image} width={34} height={34} className='' />
//           <h2 className='text-2xl'>{topic.title}</h2>
//           <p>{topic.desc}</p>
//           <Link href={`/forum/${topic.slug}`}>
//             <Button className='px-4 border border-slate-500 py-2'>Discuss Now</Button>
//           </Link>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ForumsPage;