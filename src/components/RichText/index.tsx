import { MediaBlock } from '@/features/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/features/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/features/blocks/Banner/Component'
import { CallToActionBlock } from '@/features/blocks/CallToAction/Component'
import { cn } from '@/lib/utilities/ui'
import { useLocale } from 'next-intl'
import { getDocumentPath } from '@/lib/utilities/pagePath'
import { getHeadingIds } from '@/lib/utilities/headingAnchors'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

/**
 * Zengin metin içindeki iç bağlantıları (sayfa / yazı referansı) dil önekli URL'ye çevirir.
 * Referans edilen doküman içerikle aynı dilde geldiği için slug da o dildedir.
 */
const createInternalDocToHref =
  (locale: string) =>
  ({ linkNode }: { linkNode: SerializedLinkNode }) => {
    const { value, relationTo } = linkNode.fields.doc!
    if (typeof value !== 'object') {
      throw new Error('Expected value to be an object')
    }
    const path = getDocumentPath(relationTo, value as Parameters<typeof getDocumentPath>[1]) ?? '/'
    return path === '/' ? `/${locale}` : `/${locale}${path}`
  }

/**
 * Lexical düğümlerini React bileşenlerine çeviren eşlemeyi aktif dil için üretir.
 * `headingIds`: başlıklara verilecek bağlantı kimlikleri (içindekiler tablosundan bölüme atlamak için).
 */
const createJsxConverters =
  (locale: string, headingIds: Map<object, string>): JSXConvertersFunction<NodeTypes> =>
  ({ defaultConverters }) => ({
  ...defaultConverters,
  // Başlıklar kimlikli; scroll-mt: bölüme atlanınca sabit üst menünün altında kalmasın
  heading: ({ node, nodesToJSX }) => {
    const Tag = node.tag
    return (
      <Tag id={headingIds.get(node)} className="scroll-mt-32">
        {nodesToJSX({ nodes: node.children })}
      </Tag>
    )
  },
  ...LinkJSXConverter({ internalDocToHref: createInternalDocToHref(locale) }),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

/** Payload zengin metin (Lexical) içeriğini render eder. */
export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  const locale = useLocale()
  const headingIds = getHeadingIds(props.data)
  return (
    <ConvertRichText
      converters={createJsxConverters(locale, headingIds)}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
