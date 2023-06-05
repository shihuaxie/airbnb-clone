import Image from '../components/Image.jsx';

export default function PlaceImage({place,index=0,className=null}) {
    if (!place.photos?.length) {
        return '';
    }
    if (!className) {
        className = 'object-cover';
    }
    return (
        <Image className={className} src={place.photos[index]} alt=""/>
    );
}