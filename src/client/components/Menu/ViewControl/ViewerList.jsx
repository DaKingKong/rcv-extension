import React from 'react';

const listStyle = {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginRight: '6px',
}

export function ViewerList({
    viewers
}) {
    function getInitials({ name }) {
        if (!!!name) {
            return '';
        }
        const nameSegments = name.split(' ');
        let initials = '';
        for (const seg of nameSegments) {
            initials += seg[0];
        }
        return initials;
    }

    function getInitialsStyle({ index, count }) {
        return {
            pointerEvents: 'none',
            fontFamily: 'sans-serif',
            width: '20px',
            borderRadius: '50%',
            height: '20px',
            background: "#0684BC",
            fontSize: '10px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: "#FFFFFF",
            transform: `translateX(${30 * index}%)`,
            zIndex: (count - index).toString()
        }
    }
    function getProfileImageStyle({ index, count }) {
        return {
            pointerEvents: 'none',
            width: '20px',
            borderRadius: '50%',
            height: '20px',
            transform: `translateX(${30 * index}%)`,
            zIndex: (count - index).toString()
        }
    }

    function getListItem({ viewers }) {
        if (viewers.length > 4) {
            let style = getInitialsStyle({ index: 0, count: viewers.length });
            let result = [<div key={v} style={style}>{getInitials({ name: `+${viewers.length - 4}` })}</div>];
            let counter = 0;
            for (const viewer of viewers) {
                counter++;
                style = viewer?.image ?
                    getProfileImageStyle({ index: counter, count: viewers.length }) :
                    getInitialsStyle({ index: counter, count: viewers.length });
                if (counter > 4) {
                    return result;
                }
                else {
                    result.push(
                        viewer?.image ?
                            <img key={counter} style={style} src={viewer?.image} />
                            :
                            <div key={counter} style={style}>{getInitials({ name: viewer?.name })}</div>);
                }
            }
        }
        else {
            return viewers.map((v, i) => {
                const style = v?.image ?
                    getProfileImageStyle({ index: i, count: viewers.length }) :
                    getInitialsStyle({ index: i, count: viewers.length });
                const result = v?.image ?
                    <img key={i} style={style} src={v?.image} /> :
                    <div key={i} style={style}>{getInitials({ name: v?.name })}</div>
                return result;
            })
        }
    }

    return (
        <div style={listStyle}        >
            {getListItem({ viewers })}
        </div>
    )
}