import { notFound } from "next/navigation"
import Image from "next/image";
import type { Metadata, ResolvingMetadata } from 'next'

interface PageProps {
  params: {
    slug: string[]
  }
}

type Game = {
  identifier: string; // уникальный идентификатор игры
  seo_title: string; // уникальный SEO-ключ игры
  title: string; // Текстовое название игры
  provider: string; // ID провайдера игры
  categories: string[]; // Список ID категорий, в которые входит игра
};

async function getPageFromParams({ params }: PageProps) {
  const [id, seo_title] = params.slug
  const posts: Game[] = await fetch('https://nextjs-test-pi-hazel-56.vercel.app/data/games.json').then((res) => res.json())
  const postByProvider = posts.find(post => post.seo_title === seo_title && post.provider === id)

  if (postByProvider) {
    return postByProvider
  }

  return posts.find(post => post.seo_title === seo_title && post.categories.includes(id))
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const post = await getPageFromParams({ params })

  if (!post) {
    return {
      title: '404',
    }
  }

  return {
    title: post.title,
  }
}

export async function generateStaticParams() {
  const posts: Game[] = await fetch('https://nextjs-test-pi-hazel-56.vercel.app/data/games.json').then((res) => res.json())

  const postsByProvider = posts.map(post => ({
    slug: [post.provider, post.seo_title],
  }))

  const postsByCategory = posts.flatMap(post => (
    post.categories.map(category => ({
      slug: [category, post.seo_title]
    }))
  ))

  return postsByProvider.concat(postsByCategory)
}
 
// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function Page({ params }: PageProps) {
  const page = await getPageFromParams({ params })
  
  if (!page) {
    notFound()
  }

  return (
    <article className="prose lg:prose-xl">
      <h1>{page.title}</h1>
      <h4>Provider - {page.provider}</h4>
      <Image
        src={`https://d2norla3tyc4cn.cloudfront.net/i/s3/${page.identifier}.webp`}
        width={500}
        height={500}
        alt="Picture of the author"
      />
      <h4>Categories:</h4>
      <ul>
        {page.categories.map(category => <li key={category}>{category}</li>)}
      </ul>
    </article>
  )
}