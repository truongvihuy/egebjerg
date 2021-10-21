import Image from 'next/image';

const MyImage = ({ src, alt, className }) => {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      layout='fill'
      objectFit='contain'
      unoptimized={true}
    />
  )
}

export default MyImage;