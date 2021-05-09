import React, { useState } from 'react';
import './Rating.css';

const Rating = (props) => {
    const selectedRating = props.rating || 0;
    const arr = (new Array(props.stars || 5)).fill(1).map((item, index) => {
        return { index, tempClass: false, rated: selectedRating > index };
    });
    const [array, setArray] = useState(arr);
    const [selRating, setSelRating] = useState(selectedRating);

    const mouseOver = (idx) => {
        const arr = [...array];
        for (let i = selRating; i <= idx; i++) {
            arr[i].tempClass = true;
        }
        setArray(arr);
    };

    const mouseOut = (idx) => {
        const arr = [...array];
        for (let i = 0; i < arr.length; i++) {
            arr[i].tempClass = false;
        }
        setArray(arr);
    };

    const mouseClicked = (idx) => {
        const arr = [...array];
        for (let i = 0; i < arr.length; i++) {
            arr[i].rated = (i <= idx);
        }
        setArray(arr);
        idx = idx + 1;
        setSelRating(idx);
        if (props.onSelect) {
            props.onSelect(idx);
        }
    };

    return (
        <div>
            {
                array.map((item, i) => (
                    <i key={i}
                        className={`${(item.tempClass) ? ' hover' : ''}${(item.rated) ? ' rated': ''}`}
                        onMouseOver={() => mouseOver(i)}
                        onMouseOut={() => mouseOut(i)}
                        onClick={() => mouseClicked(i)}
                    >★
                </i>))
            } {'  '} { selRating }
        </div>
    )
}

export default Rating
