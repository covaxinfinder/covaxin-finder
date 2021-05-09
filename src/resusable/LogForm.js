import React, { useState } from 'react';
import Rating from './Rating';
import './LogForm.css';
import apis from '../service/api';
import { useForm } from "react-hook-form";

const LogForm = ({lat, lng, onCreate}) => {
    const { register, handleSubmit, watch, errors, reset } = useForm();
    const [rating, setRating] = useState(0);
    const onSubmit = async (data) => {
        data['latitude'] = lat;
        data['longitude'] = lng;
        data['rating'] = rating;
        try {
            const result = await apis.createLogEntry(data);
            if (result.success) {
                reset(reset);
                onCreate();
            }
        } catch (error) {
            console.log(error);
        }
    };
    const onRatingSelect = (rating) => {
        setRating(rating);
    };
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-control">
                    <label htmlFor="title">Title</label>
                    <input type="text" name="title" id="title" placeholder="Title" ref={register({ required: true })} />
                </div>
                {errors.title && <span className="text-danger">This field is required</span>}

                <div className="form-control">
                    <label htmlFor="description">Description</label>
                    <textarea rows={3} type="text" name="description" id="description" placeholder="Nice place.."
                        ref={register({ required: true })}></textarea>
                </div>
                {errors.description && <span className="text-danger">This field is required</span>}

                <div className="form-control">
                    <label htmlFor="image_url">Image url</label>
                    <input type="text" name="image_url" id="image_url" placeholder="Image url" ref={register({ required: true, pattern: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ })} />
                </div>
                {errors.image_url && <span className="text-danger">Not a valid URL</span>}

                <div className="form-control">
                    <label htmlFor="visited_date">Visited date</label>
                    <input type="date" name="visitedDate" id="visited_date" placeholder="Visited date" ref={register({ required: true })} />
                </div>
                {errors.visitedDate && <span className="text-danger">This field is required</span>}

                <div className="form-control rating-submit">
                    <Rating stars={10} onSelect={onRatingSelect} />
                    <input type="submit" />
                </div>

            </form>
        </div>
    )
}

export default LogForm
